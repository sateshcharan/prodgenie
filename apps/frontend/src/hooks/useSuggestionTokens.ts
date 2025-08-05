// hooks/useSuggestionTokens.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../utils';
import {
  apiRoutes,
  jobCardFields,
  preDefinedKeywords,
} from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';

let _cachedSuggestions: string[] | null = null;

export const useSuggestionTokens = (extraSuggestions: string[] = []) => {
  const [suggestions, setSuggestions] = useState<string[]>(
    _cachedSuggestions || []
  );

  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('id');

  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const filetype = pathSegments[1];

  const user = useUserStore((state) => state.user);
  const hasFetchedRef = useRef(false);

  const stableExtraSuggestions = useMemo(
    () => [...extraSuggestions],
    [extraSuggestions]
  );
  const stableUser = useMemo(() => user, []);

  useEffect(() => {
    if (_cachedSuggestions) return;

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadSuggestions = async () => {
      const jobCardSuggestions = jobCardFields.flatMap((field) =>
        field.fields
          ? field.fields.map((f) => `jobCardForm_${f.name.replace('.', '_')}`)
          : [`jobCardForm_${field.name.replace('.', '_')}`]
      );

      const bomSuggestions: string[] = [];
      try {
        const {
          data: { data: bomFile },
        } = await api.get(`${apiRoutes.orgs.base}/getOrgConfig/bom.json`);
        const response = await fetch(bomFile.path);
        const json = await response.json();

        for (const section in json) {
          const expected = json[section]?.header?.expected;
          if (Array.isArray(expected)) {
            bomSuggestions.push(
              ...expected.map((f: string) => `${section}_${f}`)
            );
          }
        }
      } catch (err) {
        console.error('Error fetching BOM config:', err);
      }

      const userSuggestions = Object.keys(stableUser).map(
        (key) => `user_${key}`
      );

      let allSuggestions = [
        ...jobCardSuggestions,
        ...bomSuggestions,
        ...userSuggestions,
        ...preDefinedKeywords,
        ...stableExtraSuggestions,
      ];

      if (fileId) {
        try {
          const {
            data: { data: dynamicFieldsData },
          } = await api.get(`${apiRoutes.files.base}/getFileData/${fileId}`);
          const dynamicFields =
            dynamicFieldsData?.jobCardForm?.sections?.[0]?.fields ?? [];

          const dynamicSuggestions = dynamicFields.map(
            (f: any) => `jobCardForm_${f.name?.split('.').join('_')}`
          );

          allSuggestions = [...allSuggestions, ...dynamicSuggestions];
        } catch (err) {
          console.error('Error fetching dynamic job card fields:', err);
        }
      }

      _cachedSuggestions = allSuggestions;
      setSuggestions(allSuggestions);
    };

    loadSuggestions();
  }, [fileId, filetype, stableUser, stableExtraSuggestions]);

  return suggestions;
};
