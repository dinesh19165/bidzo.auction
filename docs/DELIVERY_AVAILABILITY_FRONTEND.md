# PIN-code delivery availability: frontend integration note

The product and checkout UI now use a shared delivery-availability adapter. Until a backend contract is supplied, its isolated default adapter reports that the service is not configured. It never guesses availability, delivery dates, or charges. A server result indicating that delivery is unavailable blocks progression in cart, Buy Now, and auction address/payment flows; a missing or failed check is shown as an error and does not falsely mark an order deliverable.

## Backend contract still required

No serviceability endpoint or response contract was present in the frontend or supplied with this change. Before connecting a real adapter, agree on:

- Endpoint path and HTTP method, to be resolved against the existing `VITE_API_BASE_URL` / `API_BASE_URL` configuration.
- Whether authentication is required and the exact request fields. The frontend currently holds the six-digit PIN code in the address record and sends no new address data to the availability adapter.
- A response shape with an authoritative serviceability decision, plus any optional estimated-delivery field. The UI must only render estimates returned by this service.
- Error semantics, including invalid/unsupported PIN codes and transient service failures.
- Whether availability is global by PIN code or scoped by product, vendor, shipment origin, or cart contents.
- Whether a negative decision must be revalidated by the order-creation endpoint; the backend must remain authoritative when creating orders.

Once agreed, implement the transport in `src/api/deliveryAvailabilityApi.ts` using `fetchJson` from `src/api/apiClient.ts`, configure the endpoint through the existing environment-based API setup, and map the confirmed backend response into `DeliveryAvailabilityResult`. Do not replace the unconfigured adapter with a success-shaped fallback.
