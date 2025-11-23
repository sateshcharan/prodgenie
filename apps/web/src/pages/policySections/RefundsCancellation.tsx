const RefundCancellationPolicy = () => {
  return (
    <div className="prose prose-sm sm:prose-base mx-auto py-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Refund and Cancellation Policy
      </h1>

      <p className="my-4">
        This Refund and Cancellation Policy explains how you may cancel an order
        or request a refund for any product or service purchased through the
        Platform.
      </p>

      <strong>
        <p className="my-4">Please review the terms below carefully:</p>
      </strong>

      <ul className="list-disc ml-6 space-y-4 marker:text-gray-500">
        <li className="pl-2">
          <strong> Order Cancellation Window:</strong> Cancellations will only
          be accepted if you submit a request within <strong>3 days</strong> of
          placing the order. However, cancellation may not be possible if the
          seller/merchant has already been notified and the shipping process has
          begun, or if the product is already out for delivery. In such cases,
          you may choose to reject the delivery at your doorstep.
        </li>

        <li className="pl-2">
          <strong> Non-Cancellable Perishable Items:</strong> Metzap does not
          accept cancellations for perishable goods such as flowers, food items,
          or similar products. Refunds or replacements may still be considered
          if you can establish that the delivered product was of poor quality.
        </li>

        <li className="pl-2">
          <strong> Damaged or Defective Products:</strong> If you receive a
          damaged or defective item, you must report it to our customer service
          team within <strong>3 days</strong> of receiving the product. The
          seller/merchant listed on the Platform will inspect the issue before
          approving any refund or replacement.
        </li>

        <li className="pl-2">
          <strong> Product Not as Described:</strong> If the product you receive
          differs from what was shown on the Platform or does not meet your
          expectations, you must notify our customer service within
          <strong> 3 days</strong> of receipt. Upon review, the customer service
          team will determine the appropriate resolution.
        </li>

        <li className="pl-2">
          <strong> Warranty-Related Complaints:</strong> Products covered by a
          manufacturer warranty must be handled directly with the manufacturer.
          Please refer to their warranty terms for assistance.
        </li>

        <li className="pl-2">
          <strong> Refund Processing Time:</strong> If a refund is approved by
          Metzap, the amount will be processed within <strong>7 days </strong>
          from the date of approval.
        </li>
      </ul>
    </div>
  );
};

export default RefundCancellationPolicy;
