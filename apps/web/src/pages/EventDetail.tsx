import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiRoutes } from '@prodgenie/libs/constant';
import api from '../utils/api';
import { Button } from '@prodgenie/libs/ui/button';
import { useWorkspaceStore } from '@prodgenie/libs/store';
import { toast } from 'sonner';

type Event = {
  id: string;
  workspaceId: string;
  userId: string;
  fileId: string | null;
  type: string;
  description: string;
  creditChange: number;
  balanceAfter: number | null;
  status: string;
  progress: number | null;
  errorData: any;
  createdAt: string;
  updatedAt: string;
};

export default function EventDetailsPage({ eventId }: { eventId: string }) {
  const navigate = useNavigate();

  const { workspaceEvents } = useWorkspaceStore();
  const event = workspaceEvents.find((e) => e.id === eventId);

  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  if (!event) return <div className="p-6">No event data</div>;

  const isPending =
    event.status === 'pending' || event.status === 'update_credits_manually';

  // ✅ Approve
  const handleApprove = async () => {
    try {
      setLoading(true);

      await api.post(`${apiRoutes.admin.base}${apiRoutes.admin.approveEvent}`, {
        eventId: event.id,
      });

      toast.success('Approved successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve event');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reject
  const handleReject = async () => {
    try {
      setLoading(true);

      await api.post(`${apiRoutes.admin.base}${apiRoutes.admin.rejectEvent}`, {
        eventId: event.id,
        remark: remarks,
      });

      toast.success('Rejected successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Event Details</h1>

      <div className="border rounded p-4 space-y-2">
        <p>
          <b>ID:</b> {event.id}
        </p>
        <p>
          <b>Type:</b> {event.type}
        </p>
        <p>
          <b>Status:</b> {event.status}
        </p>
        <p>
          <b>Description:</b> {event.description}
        </p>

        <p>
          <b>Credit Change:</b>{' '}
          <span
            className={
              event.creditChange > 0 ? 'text-green-600' : 'text-red-600'
            }
          >
            {event.creditChange > 0 ? '+' : ''}
            {event.creditChange}
          </span>
        </p>

        <p>
          <b>Balance After:</b> {event.balanceAfter ?? '—'}
        </p>

        <p>
          <b>Progress:</b> {event.progress ?? '—'}%
        </p>

        <p>
          <b>Workspace:</b> {event.workspaceId}
        </p>
        <p>
          <b>User:</b> {event.userId}
        </p>

        <p>
          <b>Created At:</b> {new Date(event.createdAt).toLocaleString()}
        </p>

        {event.errorData && Object.keys(event.errorData).length > 0 && (
          <div>
            <b>Error:</b>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {JSON.stringify(event.errorData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Remarks */}
      <div className="mt-4">
        <label className="block mb-1 font-medium">Remarks</label>
        <textarea
          className="w-full border rounded p-2 text-black"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Optional admin remarks..."
        />
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-3 mt-4">
          <Button onClick={handleApprove} disabled={loading} variant="default">
            Approve
          </Button>

          <Button
            onClick={handleReject}
            disabled={loading}
            variant="destructive"
          >
            Reject
          </Button>

          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      )}
    </div>
  );
}
