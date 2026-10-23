# Bidzo Frontend API & Developer Documentation

> Source-derived documentation for the frontend project. It describes implemented frontend behavior and request contracts as inferred from source; it does **not** establish that a backend endpoint exists or that the backend honors a request/response shape. No environment-variable values or credentials are included.

## 1. Scope and verification boundary

- Frontend root detected from `package.json`, `vite.config.ts`, and `src/`: the repository working root.
- Source inspection covers TypeScript/TSX modules under `src/`, frontend configuration, package scripts, tests, and the checked-in integration notes. No backend source or OpenAPI contract was available or inspected.
- The generated inventory contains all route declarations and page/component/context/hook/API-service/util/service files present at generation time.
- “Confirmed frontend call” means a source expression invokes a shared HTTP helper; it does not mean the URL resolves, the endpoint exists on the server, or the UI path is reachable.
- Static caller detection can miss indirect calls, callbacks, runtime-selected paths, and wrapper-mediated behavior. Browser/network traces and backend contracts remain necessary.

## 2. Project overview and architecture

Bidzo is a TypeScript single-page React application built and served with Vite. `src/main.tsx` mounts React Strict Mode and React Router's `BrowserRouter`; `src/App.tsx` nests the application providers, shared `Layout`, route guard, scroll manager, animation wrapper, and route table. Shared page chrome lives in `src/components/Layout.tsx`. Page modules commonly own their fetch lifecycle via React state/effects and call typed service functions in `src/api/`.

There is no repository-wide remote data/cache library (such as React Query) or Redux dependency. Cross-page state uses React Context; most page-specific remote state uses `useState`/`useEffect`. Tailwind utility classes coexist with global styles in `src/index.css` and `src/style.css`. Framer Motion supplies motion; Lucide supplies icons; Recharts supplies charts.

### Framework and dependencies

| Area | Source-confirmed implementation |
|---|---|
| React / React DOM | `react` and `react-dom` version ranges in `package.json` (19.2.x) |
| TypeScript | `~6.0.2`; ES2023, bundler resolution, React JSX, no emit, `src` included |
| Vite | `^8.2.0`; React and Tailwind CSS Vite plugins |
| Routing | `react-router-dom` `^7.18.2`; BrowserRouter plus declarative Routes |
| Styling | Tailwind CSS v4 Vite plugin and global CSS; no separate component styling framework |
| State | React Context API and local component state; selected data persisted in localStorage/sessionStorage |
| Runtime libraries | `framer-motion`, `lucide-react`, `recharts` |
| Test tooling | `tsx` and Node's test API |

### Direct package dependencies

| Package | Declared range | Role |
|---|---:|---|
| `react` | `^19.2.8` | UI runtime |
| `react-dom` | `^19.2.8` | DOM renderer |
| `react-router-dom` | `^7.18.2` | Client-side routing |
| `framer-motion` | `^12.43.0` | Motion and transitions |
| `lucide-react` | `^1.28.0` | Icon components |
| `recharts` | `^3.10.1` | Charts |
| `@tailwindcss/vite` | `^4.3.3` | Tailwind Vite integration |
| `@vitejs/plugin-react` | `^6.0.5` | React Vite integration |
| `@types/react` | `^19.2.18` | React TypeScript declarations |
| `@types/react-dom` | `^19.2.4` | React DOM TypeScript declarations |
| `typescript` | `~6.0.2` | TypeScript compiler |
| `vite` | `^8.2.0` | Dev server and bundler |
| `tsx` | `^4.23.13` | TypeScript test execution |

## 3. Architecture, providers, and state

Provider nesting in `App`: `AuthProvider → UserProvider → CartProvider → WalletProvider → NotificationProvider → WishlistProvider → LocaleProvider → ThemeProvider`. `BrowserRouter` wraps `App`.

| Provider / hook | Observed responsibility |
|---|---|
| `AuthProvider` / `useAuth` | User/session state, login/register/logout, role-aware portal routing and expiry events. Persists `bidzo_user` and vendor profile ID in localStorage. |
| `UserProvider` / `useUserContext` | Separate, simple in-memory user state; not a substitute for the richer AuthContext. |
| `CartProvider` / `useCartContext` | Cart actions/refresh through cart services; exposes loading/error. |
| `WalletProvider` / `useWalletContext` | In-memory wallet balance state. |
| `NotificationProvider` / `useNotificationContext` | Notification refresh/read mutations and unread count, scoped to authenticated user. |
| `WishlistProvider` / `useWishlist` | Wishlist operations, login awareness, pending/loading/error state. |
| `LocaleProvider` / `useLocaleContext` | Language/currency selection; persists locale preferences. |
| `ThemeProvider` / `useThemeContext` | Theme state and persisted theme preference. |
| `useRouteState`, `useRouteStatus` | Small state/status helpers; no network behavior. |

Directory responsibilities: `src/pages/` route-level screens; `src/components/` shared UI; `src/api/` request adapters/client; `src/context/` shared state; `src/hooks/` hooks; `src/services/` integrations/helpers; `src/utils/` workflow, formatting, validation, location and payment utilities.

## 4. Complete route and source-module inventory

### 4.1 Route map

The table below is extracted from every `<Route>` declaration in `src/App.tsx`. Duplicate declarations are retained. A route proves frontend routing only; it does not prove API integration.

**286 route declarations.**

| Path | Element | Source |
|---|---|---|
| `/` | `HomePage` | [App.tsx:240](../src/App.tsx#L240) |
| `/delivery-share/:token` | `DeliverySharePage` | [App.tsx:242](../src/App.tsx#L242) |
| `/about` | `AboutPage` | [App.tsx:241](../src/App.tsx#L241) |
| `/contact` | `ContactPage` | [App.tsx:242](../src/App.tsx#L242) |
| `/faq` | `FAQPage` | [App.tsx:243](../src/App.tsx#L243) |
| `/blog` | `BlogPage` | [App.tsx:244](../src/App.tsx#L244) |
| `/privacy` | `PolicyPage` | [App.tsx:245](../src/App.tsx#L245) |
| `/terms` | `PolicyPage` | [App.tsx:253](../src/App.tsx#L253) |
| `/refund` | `PolicyPage` | [App.tsx:263](../src/App.tsx#L263) |
| `/seller-policy` | `PolicyPage` | [App.tsx:272](../src/App.tsx#L272) |
| `/auction-rules` | `PolicyPage` | [App.tsx:273](../src/App.tsx#L273) |
| `/help` | `HelpCenterPage` | [App.tsx:274](../src/App.tsx#L274) |
| `/marketplace` | `MarketplacePage` | [App.tsx:275](../src/App.tsx#L275) |
| `/product/:id` | `ProductDetailPage` | [App.tsx:276](../src/App.tsx#L276) |
| `/marketplace/:id` | `ProductDetailPage` | [App.tsx:277](../src/App.tsx#L277) |
| `/auction/:id` | `AuctionDetailPage` | [App.tsx:278](../src/App.tsx#L278) |
| `/seller/:id` | `SellerProfilePage` | [App.tsx:279](../src/App.tsx#L279) |
| `/wishlist` | `WishlistPage` | [App.tsx:280](../src/App.tsx#L280) |
| `/auctions` | `AuctionsPage` | [App.tsx:281](../src/App.tsx#L281) |
| `/auctions/:id` | `AuctionDetailPage` | [App.tsx:282](../src/App.tsx#L282) |
| `/login` | `LoginPage` | [App.tsx:283](../src/App.tsx#L283) |
| `/register` | `RegisterPage` | [App.tsx:284](../src/App.tsx#L284) |
| `/onboarding` | `OnboardingWizard` | [App.tsx:285](../src/App.tsx#L285) |
| `/welcome/customer` | `CustomerWelcome` | [App.tsx:286](../src/App.tsx#L286) |
| `/welcome/vendor` | `VendorWelcome` | [App.tsx:287](../src/App.tsx#L287) |
| `/register/customer` | `CustomerRegisterPage` | [App.tsx:288](../src/App.tsx#L288) |
| `/register/vendor` | `VendorRegisterPage` | [App.tsx:289](../src/App.tsx#L289) |
| `/otp` | `OTPPage` | [App.tsx:290](../src/App.tsx#L290) |
| `/forgot-password` | `ForgotPasswordPage` | [App.tsx:291](../src/App.tsx#L291) |
| `/reset-password` | `ResetPasswordPage` | [App.tsx:292](../src/App.tsx#L292) |
| `/kyc` | `KYCPage` | [App.tsx:293](../src/App.tsx#L293) |
| `/registration-fee` | `RegistrationFeePage` | [App.tsx:294](../src/App.tsx#L294) |
| `/customer/registration-fee` | `RegistrationFeePage` | [App.tsx:295](../src/App.tsx#L295) |
| `/dashboards/customer` | `CustomerDashboardPage` | [App.tsx:296](../src/App.tsx#L296) |
| `/customer/dashboard` | `CustomerDashboardPage` | [App.tsx:297](../src/App.tsx#L297) |
| `/customer/profile` | `CustomerProfilePage` | [App.tsx:298](../src/App.tsx#L298) |
| `/customer/orders` | `CustomerOrdersPage` | [App.tsx:299](../src/App.tsx#L299) |
| `/customer/orders/:id` | `CustomerOrderDetailPage` | [App.tsx:300](../src/App.tsx#L300) |
| `/customer/auctions/live` | `CustomerAuctionsPage` | [App.tsx:301](../src/App.tsx#L301) |
| `/customer/auctions/upcoming` | `CustomerAuctionsPage` | [App.tsx:302](../src/App.tsx#L302) |
| `/customer/auctions/won` | `CustomerWonAuctionsPage` | [App.tsx:303](../src/App.tsx#L303) |
| `/customer/auctions/:id/pay` | `CustomerAuctionDetailPage` | [App.tsx:304](../src/App.tsx#L304) |
| `/customer/auctions` | `CustomerAuctionsPage` | [App.tsx:305](../src/App.tsx#L305) |
| `/customer/auctions/:id` | `CustomerAuctionDetailPage` | [App.tsx:306](../src/App.tsx#L306) |
| `/customer/wallet` | `CustomerWalletPage` | [App.tsx:307](../src/App.tsx#L307) |
| `/customer/wallet/transactions` | `CustomerTransactionsPage` | [App.tsx:308](../src/App.tsx#L308) |
| `/customer/bids` | `CustomerBidsPage` | [App.tsx:309](../src/App.tsx#L309) |
| `/customer/won` | `CustomerWonAuctionsPage` | [App.tsx:310](../src/App.tsx#L310) |
| `/customer/wishlist` | `CustomerWishlistPage` | [App.tsx:311](../src/App.tsx#L311) |
| `/customer/recently-viewed` | `CustomerRecentlyViewedPage` | [App.tsx:312](../src/App.tsx#L312) |
| `/customer/saved-searches` | `CustomerSavedSearchesPage` | [App.tsx:313](../src/App.tsx#L313) |
| `/customer/transactions` | `CustomerTransactionsPage` | [App.tsx:314](../src/App.tsx#L314) |
| `/customer/addresses` | `CustomerAddressesPage` | [App.tsx:315](../src/App.tsx#L315) |
| `/customer/messages` | `CustomerMessagesPage` | [App.tsx:316](../src/App.tsx#L316) |
| `/customer/notifications` | `NotificationsPage` | [App.tsx:317](../src/App.tsx#L317) |
| `/customer/rewards` | `CustomerRewardsPage` | [App.tsx:318](../src/App.tsx#L318) |
| `/customer/offers` | `CustomerOffersPage` | [App.tsx:319](../src/App.tsx#L319) |
| `/customer/reviews` | `CustomerReviewsPage` | [App.tsx:320](../src/App.tsx#L320) |
| `/customer/support` | `CustomerSupportPage` | [App.tsx:321](../src/App.tsx#L321) |
| `/customer/invoices` | `CustomerInvoicesPage` | [App.tsx:322](../src/App.tsx#L322) |
| `/customer/settings` | `CustomerSettingsPage` | [App.tsx:323](../src/App.tsx#L323) |
| `/customer/search-products` | `CustomerSearchPage` | [App.tsx:324](../src/App.tsx#L324) |
| `/customer/filter-products` | `CustomerFilterPage` | [App.tsx:325](../src/App.tsx#L325) |
| `/customer/category` | `CustomerCategoryPage` | [App.tsx:326](../src/App.tsx#L326) |
| `/customer/product/:id` | `CustomerProductPage` | [App.tsx:327](../src/App.tsx#L327) |
| `/customer/seller/:id` | `CustomerSellerPage` | [App.tsx:328](../src/App.tsx#L328) |
| `/customer/watch-auction` | `CustomerWatchAuctionPage` | [App.tsx:329](../src/App.tsx#L329) |
| `/customer/place-bid` | `CustomerPlaceBidPage` | [App.tsx:330](../src/App.tsx#L330) |
| `/customer/bid-confirmation` | `CustomerBidConfirmationPage` | [App.tsx:331](../src/App.tsx#L331) |
| `/customer/wallet-payment` | `CustomerWalletPaymentPage` | [App.tsx:332](../src/App.tsx#L332) |
| `/customer/auction-live` | `CustomerAuctionLivePage` | [App.tsx:333](../src/App.tsx#L333) |
| `/customer/winner` | `CustomerWinnerPage` | [App.tsx:334](../src/App.tsx#L334) |
| `/customer/checkout` | `CustomerCheckoutPage` | [App.tsx:335](../src/App.tsx#L335) |
| `/customer/cart` | `CustomerCartPage` | [App.tsx:336](../src/App.tsx#L336) |
| `/customer/address` | `CustomerAddressPage` | [App.tsx:337](../src/App.tsx#L337) |
| `/customer/shipping` | `CustomerShippingPage` | [App.tsx:338](../src/App.tsx#L338) |
| `/customer/payment` | `CustomerPaymentPage` | [App.tsx:339](../src/App.tsx#L339) |
| `/customer/order-success` | `CustomerOrderSuccessPage` | [App.tsx:340](../src/App.tsx#L340) |
| `/customer/invoice` | `CustomerInvoicePage` | [App.tsx:341](../src/App.tsx#L341) |
| `/customer/track-order` | `CustomerTrackOrderPage` | [App.tsx:342](../src/App.tsx#L342) |
| `/customer/delivered` | `CustomerDeliveredPage` | [App.tsx:343](../src/App.tsx#L343) |
| `/customer/review` | `CustomerReviewPage` | [App.tsx:344](../src/App.tsx#L344) |
| `/customer/buynow-confirm` | `BuyNowConfirmPage` | [App.tsx:345](../src/App.tsx#L345) |
| `/customer/buynow-payment` | `BuyNowPaymentPage` | [App.tsx:346](../src/App.tsx#L346) |
| `/customer/buynow-success` | `BuyNowOrderSuccessPage` | [App.tsx:347](../src/App.tsx#L347) |
| `/customer/buynow-invoice` | `BuyNowInvoicePage` | [App.tsx:348](../src/App.tsx#L348) |
| `/dashboards/vendor` | `VendorDashboardPage` | [App.tsx:349](../src/App.tsx#L349) |
| `/vendor/dashboard` | `VendorDashboardPage` | [App.tsx:350](../src/App.tsx#L350) |
| `/vendor/business-info` | `VendorBusinessInfoPage` | [App.tsx:351](../src/App.tsx#L351) |
| `/vendor/gst` | `VendorGstPage` | [App.tsx:352](../src/App.tsx#L352) |
| `/vendor/bank` | `VendorBankPage` | [App.tsx:353](../src/App.tsx#L353) |
| `/vendor/identity` | `VendorIdentityPage` | [App.tsx:354](../src/App.tsx#L354) |
| `/vendor/store-verification` | `VendorStoreVerificationPage` | [App.tsx:355](../src/App.tsx#L355) |
| `/vendor/store-profile` | `VendorStoreProfilePage` | [App.tsx:356](../src/App.tsx#L356) |
| `/vendor/store-settings` | `VendorStoreSettingsPage` | [App.tsx:357](../src/App.tsx#L357) |
| `/vendor/subscription` | `VendorSubscriptionPage` | [App.tsx:358](../src/App.tsx#L358) |
| `/vendor/wallet` | `VendorWalletPage` | [App.tsx:359](../src/App.tsx#L359) |
| `/vendor/withdraw` | `VendorWithdrawPage` | [App.tsx:360](../src/App.tsx#L360) |
| `/vendor/analytics` | `VendorSalesAnalyticsPage` | [App.tsx:361](../src/App.tsx#L361) |
| `/vendor/orders` | `VendorOrdersPage` | [App.tsx:362](../src/App.tsx#L362) |
| `/vendor/customers` | `VendorCustomersPage` | [App.tsx:363](../src/App.tsx#L363) |
| `/vendor/inventory` | `VendorInventoryPage` | [App.tsx:364](../src/App.tsx#L364) |
| `/vendor/products` | `VendorProductsPage` | [App.tsx:365](../src/App.tsx#L365) |
| `/vendor/create-product` | `VendorCreateProductPage` | [App.tsx:366](../src/App.tsx#L366) |
| `/vendor/edit-product` | `VendorEditProductPage` | [App.tsx:367](../src/App.tsx#L367) |
| `/vendor/variants` | `VendorProductVariantsPage` | [App.tsx:368](../src/App.tsx#L368) |
| `/vendor/create-product` | `VendorCreateProductPage` | [App.tsx:369](../src/App.tsx#L369) |
| `/vendor/edit-product` | `VendorEditProductPage` | [App.tsx:370](../src/App.tsx#L370) |
| `/vendor/delete-product` | `VendorDeleteProductPage` | [App.tsx:371](../src/App.tsx#L371) |
| `/vendor/create-auction` | `VendorCreateAuctionPage` | [App.tsx:372](../src/App.tsx#L372) |
| `/vendor/create-product-wizard` | `VendorCreateProductWizardPage` | [App.tsx:373](../src/App.tsx#L373) |
| `/vendor/edit-product-wizard/:id` | `VendorEditProductWizardPage` | [App.tsx:374](../src/App.tsx#L374) |
| `/vendor/create-auction-wizard` | `VendorCreateAuctionWizardPage` | [App.tsx:375](../src/App.tsx#L375) |
| `/vendor/edit-auction` | `VendorEditAuctionPage` | [App.tsx:376](../src/App.tsx#L376) |
| `/vendor/auction-analytics` | `VendorAuctionAnalyticsPage` | [App.tsx:377](../src/App.tsx#L377) |
| `/vendor/offers` | `VendorOffersPage` | [App.tsx:378](../src/App.tsx#L378) |
| `/vendor/advertisements` | `VendorAdvertisementPage` | [App.tsx:379](../src/App.tsx#L379) |
| `/vendor/advertisements/create` | `VendorAdvertisementCreatePage` | [App.tsx:380](../src/App.tsx#L380) |
| `/vendor/advertisements/:id` | `VendorAdvertisementDetailPage` | [App.tsx:381](../src/App.tsx#L381) |
| `/vendor/messages` | `VendorMessagesPage` | [App.tsx:382](../src/App.tsx#L382) |
| `/vendor/notifications` | `VendorNotificationsPage` | [App.tsx:383](../src/App.tsx#L383) |
| `/vendor/wallet` | `WalletPage` | [App.tsx:384](../src/App.tsx#L384) |
| `/vendor/reports` | `VendorReportsPage` | [App.tsx:385](../src/App.tsx#L385) |
| `/vendor/settings` | `VendorStoreSettingsPage` | [App.tsx:386](../src/App.tsx#L386) |
| `/vendor/reviews` | `VendorReviewsPage` | [App.tsx:387](../src/App.tsx#L387) |
| `/vendor/support` | `VendorSupportTicketsPage` | [App.tsx:388](../src/App.tsx#L388) |
| `/vendor/reports` | `VendorReportsPage` | [App.tsx:389](../src/App.tsx#L389) |
| `/dashboards/admin` | `AdminDashboardApiPage` | [App.tsx:390](../src/App.tsx#L390) |
| `/admin/dashboard` | `AdminDashboardApiPage` | [App.tsx:391](../src/App.tsx#L391) |
| `/franchise/dashboard` | `FranchiseDashboardPage` | [App.tsx:392](../src/App.tsx#L392) |
| `/franchise/vendors` | `FranchiseVendorsPage` | [App.tsx:393](../src/App.tsx#L393) |
| `/franchise/vendors/:id` | `FranchiseEntityDetailPage` | [App.tsx:394](../src/App.tsx#L394) |
| `/franchise/products` | `FranchiseProductsPage` | [App.tsx:395](../src/App.tsx#L395) |
| `/franchise/products/:id` | `FranchiseEntityDetailPage` | [App.tsx:396](../src/App.tsx#L396) |
| `/franchise/orders` | `FranchiseOrdersPage` | [App.tsx:397](../src/App.tsx#L397) |
| `/franchise/orders/:id` | `FranchiseEntityDetailPage` | [App.tsx:398](../src/App.tsx#L398) |
| `/franchise/analytics` | `FranchiseAnalyticsPage` | [App.tsx:399](../src/App.tsx#L399) |
| `/franchise/customers` | `FranchiseCustomersPage` | [App.tsx:400](../src/App.tsx#L400) |
| `/franchise/product-inspections` | `FranchiseUnavailablePage` | [App.tsx:401](../src/App.tsx#L401) |
| `/franchise/advertisements` | `FranchiseAdvertisementPage` | [App.tsx:402](../src/App.tsx#L402) |
| `/franchise/advertisements/:id` | `FranchiseAdvertisementDetailPage` | [App.tsx:403](../src/App.tsx#L403) |
| `/admin/organization-hierarchy` | `OrganizationHierarchyPage` | [App.tsx:404](../src/App.tsx#L404) |
| `/admin/login` | `AdminLoginPage` | [App.tsx:405](../src/App.tsx#L405) |
| `/admin/franchises` | `FranchiseManagementPage` | [App.tsx:406](../src/App.tsx#L406) |
| `/admin/locations` | `LocationManagementPage` | [App.tsx:407](../src/App.tsx#L407) |
| `/admin/roles` | `RolePermissionPage` | [App.tsx:408](../src/App.tsx#L408) |
| `/admin/franchise-dashboard` | `LegacyFranchiseDashboardPage` | [App.tsx:409](../src/App.tsx#L409) |
| `/admin/franchise` | `FranchiseManagementAdminPage` | [App.tsx:410](../src/App.tsx#L410) |
| `/admin/users` | `AdminResourcePage` | [App.tsx:411](../src/App.tsx#L411) |
| `/admin/customers` | `AdminResourcePage` | [App.tsx:412](../src/App.tsx#L412) |
| `/admin/customers/:id` | `AdminResourceDetailPage` | [App.tsx:413](../src/App.tsx#L413) |
| `/admin/contact` | `AdminContactMessagesPage` | [App.tsx:414](../src/App.tsx#L414) |
| `/admin/products` | `AdminResourcePage` | [App.tsx:415](../src/App.tsx#L415) |
| `/admin/payments` | `AdminResourcePage` | [App.tsx:416](../src/App.tsx#L416) |
| `/admin/vendors` | `AdminResourcePage` | [App.tsx:417](../src/App.tsx#L417) |
| `/admin/orders` | `AdminResourcePage` | [App.tsx:418](../src/App.tsx#L418) |
| `/admin/delivery` | `DeliveryManagementAdminPage` | [App.tsx:419](../src/App.tsx#L419) |
| `/admin/wallet` | `WalletManagementAdminPage` | [App.tsx:420](../src/App.tsx#L420) |
| `/admin/auctions` | `AdminResourcePage` | [App.tsx:421](../src/App.tsx#L421) |
| `/admin/content` | `ContentManagementAdminPage` | [App.tsx:422](../src/App.tsx#L422) |
| `/admin/super-dashboard` | `AdminDashboardApiPage` | [App.tsx:423](../src/App.tsx#L423) |
| `/admin/permissions` | `RolePermissionMatrixPage` | [App.tsx:424](../src/App.tsx#L424) |
| `/admin/approvals` | `ApprovalCenterPage` | [App.tsx:425](../src/App.tsx#L425) |
| `/admin/settings` | `SystemSettingsPage` | [App.tsx:426](../src/App.tsx#L426) |
| `/admin/cms` | `CMSPage` | [App.tsx:427](../src/App.tsx#L427) |
| `/admin/promotional-banners` | `PromotionalBannersAdminPage` | [App.tsx:428](../src/App.tsx#L428) |
| `/admin/advertisements` | `AdminAdvertisementPage` | [App.tsx:429](../src/App.tsx#L429) |
| `/admin/advertisements/:id` | `AdminAdvertisementDetailPage` | [App.tsx:430](../src/App.tsx#L430) |
| `/admin/offers` | `OffersAdminPage` | [App.tsx:431](../src/App.tsx#L431) |
| `/admin/cms/banners` | `CMSBannersPage` | [App.tsx:432](../src/App.tsx#L432) |
| `/admin/cms/categories` | `CMSCategoriesPage` | [App.tsx:433](../src/App.tsx#L433) |
| `/admin/cms/faq` | `CMSFaqPage` | [App.tsx:434](../src/App.tsx#L434) |
| `/admin/cms/blog` | `CMSBlogPage` | [App.tsx:435](../src/App.tsx#L435) |
| `/admin/cms/testimonials` | `CMSTestimonialsPage` | [App.tsx:436](../src/App.tsx#L436) |
| `/admin/cms/newsletter` | `CMSNewsletterPage` | [App.tsx:437](../src/App.tsx#L437) |
| `/admin/cms/pages` | `CMSPagesPage` | [App.tsx:438](../src/App.tsx#L438) |
| `/admin/settings` | `SystemSettingsPage` | [App.tsx:439](../src/App.tsx#L439) |
| `/admin/settings/general` | `SettingsGeneralPage` | [App.tsx:440](../src/App.tsx#L440) |
| `/admin/settings/auction-rules` | `SettingsAuctionRulesPage` | [App.tsx:441](../src/App.tsx#L441) |
| `/admin/settings/registration-fee` | `SettingsRegistrationFeePage` | [App.tsx:442](../src/App.tsx#L442) |
| `/admin/settings/commission-rules` | `SettingsCommissionRulesPage` | [App.tsx:443](../src/App.tsx#L443) |
| `/admin/settings/platform-charges` | `SettingsPlatformChargesPage` | [App.tsx:444](../src/App.tsx#L444) |
| `/admin/settings/shipping-rules` | `SettingsShippingRulesPage` | [App.tsx:445](../src/App.tsx#L445) |
| `/admin/settings/tax` | `SettingsTaxPage` | [App.tsx:446](../src/App.tsx#L446) |
| `/admin/settings/email` | `SettingsEmailPage` | [App.tsx:447](../src/App.tsx#L447) |
| `/admin/settings/sms` | `SettingsSmsPage` | [App.tsx:448](../src/App.tsx#L448) |
| `/admin/settings/notification-templates` | `SettingsNotificationTemplatesPage` | [App.tsx:449](../src/App.tsx#L449) |
| `/admin/settings/security` | `SettingsSecurityPage` | [App.tsx:450](../src/App.tsx#L450) |
| `/admin/settings/localization` | `SettingsLocalizationPage` | [App.tsx:451](../src/App.tsx#L451) |
| `/admin/settings/rewards` | `AdminRewardsSettingsPage` | [App.tsx:452](../src/App.tsx#L452) |
| `/admin/approvals` | `ApprovalCenterPage` | [App.tsx:453](../src/App.tsx#L453) |
| `/admin/approvals/vendors` | `ApprovalVendorsPage` | [App.tsx:454](../src/App.tsx#L454) |
| `/admin/approvals/franchises` | `ApprovalFranchisesPage` | [App.tsx:455](../src/App.tsx#L455) |
| `/admin/approvals/products` | `ApprovalProductsPage` | [App.tsx:456](../src/App.tsx#L456) |
| `/admin/approvals/auctions` | `ApprovalAuctionsPage` | [App.tsx:457](../src/App.tsx#L457) |
| `/admin/approvals/kyc` | `ApprovalKycPage` | [App.tsx:458](../src/App.tsx#L458) |
| `/admin/permissions` | `RolePermissionMatrixPage` | [App.tsx:459](../src/App.tsx#L459) |
| `/admin/permissions/roles` | `PermissionsRolesPage` | [App.tsx:460](../src/App.tsx#L460) |
| `/admin/permissions/roles/create` | `PermissionsRoleCreatePage` | [App.tsx:461](../src/App.tsx#L461) |
| `/admin/permissions/roles/:id` | `PermissionsRoleDetailPage` | [App.tsx:462](../src/App.tsx#L462) |
| `/admin/permissions/matrix` | `PermissionsMatrixPage` | [App.tsx:463](../src/App.tsx#L463) |
| `/admin/reports` | `ReportsPage` | [App.tsx:464](../src/App.tsx#L464) |
| `/admin/reports/sales` | `ReportsSalesPage` | [App.tsx:465](../src/App.tsx#L465) |
| `/admin/reports/revenue` | `AdminReportApiPage` | [App.tsx:466](../src/App.tsx#L466) |
| `/admin/reports/auctions` | `AdminReportApiPage` | [App.tsx:467](../src/App.tsx#L467) |
| `/admin/reports/vendors` | `AdminReportApiPage` | [App.tsx:468](../src/App.tsx#L468) |
| `/admin/reports/customers` | `AdminReportApiPage` | [App.tsx:469](../src/App.tsx#L469) |
| `/admin/reports/orders` | `AdminReportApiPage` | [App.tsx:470](../src/App.tsx#L470) |
| `/admin/reports/payments` | `AdminReportApiPage` | [App.tsx:471](../src/App.tsx#L471) |
| `/admin/reports/delivery` | `ReportsDeliveryPage` | [App.tsx:472](../src/App.tsx#L472) |
| `/admin/reports/wallet` | `ReportsWalletPage` | [App.tsx:473](../src/App.tsx#L473) |
| `/admin/reports/commission` | `ReportsCommissionPage` | [App.tsx:474](../src/App.tsx#L474) |
| `/admin/reports/franchise` | `ReportsFranchisePage` | [App.tsx:475](../src/App.tsx#L475) |
| `/admin/franchise` | `FranchiseManagementAdminPage` | [App.tsx:476](../src/App.tsx#L476) |
| `/admin/franchise/create` | `AdminFranchiseCreatePage` | [App.tsx:477](../src/App.tsx#L477) |
| `/admin/franchise/admins/create` | `FranchiseAdminCreatePage` | [App.tsx:478](../src/App.tsx#L478) |
| `/admin/franchise/:id` | `AdminFranchiseDetailPage` | [App.tsx:479](../src/App.tsx#L479) |
| `/admin/franchise/:id/edit` | `AdminFranchiseEditPage` | [App.tsx:480](../src/App.tsx#L480) |
| `/admin/franchise/:id/vendors` | `AdminFranchiseVendorsPage` | [App.tsx:481](../src/App.tsx#L481) |
| `/admin/franchise/:id/orders` | `AdminFranchiseOrdersPage` | [App.tsx:482](../src/App.tsx#L482) |
| `/admin/franchise/:id/performance` | `AdminFranchisePerformancePage` | [App.tsx:483](../src/App.tsx#L483) |
| `/admin/vendors` | `AdminResourcePage` | [App.tsx:484](../src/App.tsx#L484) |
| `/admin/vendors/:id` | `AdminResourceDetailPage` | [App.tsx:485](../src/App.tsx#L485) |
| `/admin/vendors/:id/edit` | `AdminVendorEditPage` | [App.tsx:486](../src/App.tsx#L486) |
| `/admin/vendors/:id/products` | `AdminVendorProductsPage` | [App.tsx:487](../src/App.tsx#L487) |
| `/admin/vendors/:id/auctions` | `AdminVendorAuctionsPage` | [App.tsx:488](../src/App.tsx#L488) |
| `/admin/vendors/:id/orders` | `AdminVendorOrdersPage` | [App.tsx:489](../src/App.tsx#L489) |
| `/admin/vendors/:id/wallet` | `AdminVendorWalletPage` | [App.tsx:490](../src/App.tsx#L490) |
| `/admin/vendors/:id/kyc` | `AdminVendorKycPage` | [App.tsx:491](../src/App.tsx#L491) |
| `/admin/vendors/:id/performance` | `AdminVendorPerformancePage` | [App.tsx:492](../src/App.tsx#L492) |
| `/admin/orders` | `AdminResourcePage` | [App.tsx:493](../src/App.tsx#L493) |
| `/admin/orders/:id` | `AdminResourceDetailPage` | [App.tsx:494](../src/App.tsx#L494) |
| `/admin/delivery` | `DeliveryManagementAdminPage` | [App.tsx:495](../src/App.tsx#L495) |
| `/admin/delivery/partners` | `DeliveryPartnersPage` | [App.tsx:496](../src/App.tsx#L496) |
| `/admin/delivery/partners/:id` | `DeliveryPartnerDetailPage` | [App.tsx:497](../src/App.tsx#L497) |
| `/admin/delivery/assignments` | `DeliveryAssignmentsPage` | [App.tsx:498](../src/App.tsx#L498) |
| `/admin/delivery/performance` | `DeliveryPerformancePage` | [App.tsx:499](../src/App.tsx#L499) |
| `/admin/wallet` | `WalletManagementAdminPage` | [App.tsx:500](../src/App.tsx#L500) |
| `/admin/wallet/transactions` | `WalletTransactionsPage` | [App.tsx:501](../src/App.tsx#L501) |
| `/admin/wallet/withdrawals` | `WalletWithdrawalsPage` | [App.tsx:502](../src/App.tsx#L502) |
| `/admin/wallet/refunds` | `WalletRefundsPage` | [App.tsx:503](../src/App.tsx#L503) |
| `/admin/wallet/settlements` | `WalletSettlementsPage` | [App.tsx:504](../src/App.tsx#L504) |
| `/admin/wallet/commissions` | `WalletCommissionsPage` | [App.tsx:505](../src/App.tsx#L505) |
| `/admin/wallet/transactions/:id` | `WalletTransactionDetailPage` | [App.tsx:506](../src/App.tsx#L506) |
| `/admin/auctions` | `AdminResourcePage` | [App.tsx:507](../src/App.tsx#L507) |
| `/admin/auctions/live` | `AuctionLivePage` | [App.tsx:508](../src/App.tsx#L508) |
| `/admin/auctions/upcoming` | `AuctionUpcomingPage` | [App.tsx:509](../src/App.tsx#L509) |
| `/admin/auctions/completed` | `AuctionCompletedPage` | [App.tsx:510](../src/App.tsx#L510) |
| `/admin/auctions/pending` | `AuctionPendingPage` | [App.tsx:511](../src/App.tsx#L511) |
| `/admin/auctions/:id` | `AdminResourceDetailPage` | [App.tsx:512](../src/App.tsx#L512) |
| `/admin/auctions/:id/bids` | `AuctionBidHistoryPage` | [App.tsx:513](../src/App.tsx#L513) |
| `/admin/content` | `ContentManagementAdminPage` | [App.tsx:514](../src/App.tsx#L514) |
| `/admin/content/categories` | `ContentCategoriesPage` | [App.tsx:515](../src/App.tsx#L515) |
| `/admin/content/banners` | `ContentBannersPage` | [App.tsx:516](../src/App.tsx#L516) |
| `/admin/content/announcements` | `ContentAnnouncementsPage` | [App.tsx:517](../src/App.tsx#L517) |
| `/admin/content/notifications` | `ContentNotificationsPage` | [App.tsx:518](../src/App.tsx#L518) |
| `/admin/notifications` | `ContentNotificationsPage` | [App.tsx:519](../src/App.tsx#L519) |
| `/admin/content/faq` | `ContentFaqPage` | [App.tsx:520](../src/App.tsx#L520) |
| `/admin/content/help` | `ContentHelpPage` | [App.tsx:521](../src/App.tsx#L521) |
| `/delivery` | `DeliveryPage` | [App.tsx:522](../src/App.tsx#L522) |
| `/wallet` | `WalletPage` | [App.tsx:523](../src/App.tsx#L523) |
| `/wallet/add-money` | `AddMoneyPage` | [App.tsx:524](../src/App.tsx#L524) |
| `/wallet/withdraw` | `WithdrawPage` | [App.tsx:525](../src/App.tsx#L525) |
| `/chat` | `ChatPage` | [App.tsx:526](../src/App.tsx#L526) |
| `/chat/admin` | `AdminChatPage` | [App.tsx:527](../src/App.tsx#L527) |
| `/chat/support` | `SupportChatPage` | [App.tsx:528](../src/App.tsx#L528) |
| `/notifications` | `NotificationsPage` | [App.tsx:529](../src/App.tsx#L529) |
| `/categories` | `CategoriesPage` | [App.tsx:530](../src/App.tsx#L530) |
| `/categories/sub` | `SubCategoriesPage` | [App.tsx:531](../src/App.tsx#L531) |
| `/search` | `SearchResultsPage` | [App.tsx:532](../src/App.tsx#L532) |
| `/recommended` | `RecommendedPage` | [App.tsx:533](../src/App.tsx#L533) |
| `/auctions/live` | `LiveAuctionsPage` | [App.tsx:534](../src/App.tsx#L534) |
| `/auctions/upcoming` | `UpcomingAuctionsPage` | [App.tsx:535](../src/App.tsx#L535) |
| `/auctions/ended` | `EndedAuctionsPage` | [App.tsx:536](../src/App.tsx#L536) |
| `/auctions/winner` | `WinnerScreenPage` | [App.tsx:537](../src/App.tsx#L537) |
| `/support-tickets` | `SupportTicketsPage` | [App.tsx:538](../src/App.tsx#L538) |
| `/invoices` | `InvoicesPage` | [App.tsx:539](../src/App.tsx#L539) |
| `/downloads` | `DownloadsPage` | [App.tsx:540](../src/App.tsx#L540) |
| `/commission-settings` | `CommissionSettingsPage` | [App.tsx:541](../src/App.tsx#L541) |
| `/refunds` | `RefundsPage` | [App.tsx:542](../src/App.tsx#L542) |
| `/roles` | `RolesPage` | [App.tsx:543](../src/App.tsx#L543) |
| `/newsletter` | `NewsletterPage` | [App.tsx:544](../src/App.tsx#L544) |
| `/press` | `PressPage` | [App.tsx:545](../src/App.tsx#L545) |
| `/maintenance` | `MaintenancePage` | [App.tsx:546](../src/App.tsx#L546) |
| `/coming-soon` | `ComingSoonPage` | [App.tsx:547](../src/App.tsx#L547) |
| `/*` | `NotFoundPage` | [App.tsx:548](../src/App.tsx#L548) |

### 4.2 Page, component, context, hook, utility, and service inventory

Appendix A contains every source file found in each of these directories. It also contains all API modules with a concise source-observed purpose. The UI routes and component inventory are source evidence, not integration claims.

Complete file inventories are in Appendix A.

## 5. Authentication, authorization, and session lifecycle

### Login

`/login` renders `LoginPage`. It accepts email or phone plus password, validates required fields, and calls `useAuth().login(identifier, password, selectedRole)`. `AuthProvider.login` submits unauthenticated `POST /auth/login` with `{ email: identifier, password }`, requires a token in the response, persists it under `bidzo_user`, then calls `GET /auth/me` using the token explicitly. The provider maps role to customer/vendor/admin/delivery/support, verifies the selected customer/vendor login role, and updates context. The form routes by role and renders field-level error/loading state.

**Integration risk:** the form accepts a phone number but the request property remains `email`; confirm server-side identifier semantics.

### Registration and OTP

- `/register/customer` and `/register/vendor` validate credentials/profile fields and call `registerCustomer` / `registerVendor` → unauthenticated `POST /auth/register`.
- The request DTO includes username, email, password, CUSTOMER/VENDOR role, phoneNumber, and optional customer referralCode. Vendor owner/GST inputs are not included in this registration DTO; later vendor/KYC operations handle some profile data.
- Successful registration navigates to `/otp`; OTP verification uses `POST /auth/verify-registration-otp`, resend uses `POST /auth/resend-registration-otp`, and the UI chooses EMAIL or SMS and selects email vs phoneNumber. OTP settings are read from admin settings service. Retry/cooldown and form messages are page-managed.
- Frontend wiring does not verify OTP delivery, storage, expiry, or backend registration state.

### Forgot and reset password

- `/forgot-password` calls unauthenticated `POST /auth/forgot-password` with email, then routes to `/otp` in reset flow.
- Reset OTP uses `POST /auth/verify-reset-otp`. Returned reset token is stored in sessionStorage as `bidzo_reset_token` and may also be carried in route state.
- `/reset-password` calls `POST /auth/reset-password` with email, OTP, newPassword, and resetToken/token when available; success clears reset-token state and returns to login. Password complexity checks are client-side.
- Errors/success text and busy state are managed by the pages. No refresh-token endpoint/interceptor was found.

### Authorization and expiry

`AppRouteGuard` applies client navigation gates for customer, vendor, admin and KYC areas. Admin roles are ADMIN/SUPER_ADMIN/FRANCHISE_ADMIN; franchise administrators are redirected to franchise dashboard. Vendor dashboard checks KYC state and sends incomplete vendors to `/kyc`. These checks are UX-only; backend authorization and resource ownership must be enforced server-side.

The shared client reads token from localStorage (`bidzo_user` and supported token aliases), checks JWT `exp`, adds a Bearer Authorization header, and handles 401 by clearing user/vendor ID, dispatching `bidzo:session-expired`, and redirecting to admin login or normal login. 403 becomes a permission error. No refresh/retry mechanism was found. `bidzo_expired_login_role` temporarily preserves a vendor login hint in sessionStorage.

## 6. API base URL, HTTP client, environment, and CORS

`src/api/apiClient.ts` selects `VITE_API_BASE_URL` when configured; otherwise it uses `/api` in Vite development and `https://api.bidzo.auction/api` in non-development builds. `getApiUrl` leaves absolute HTTP(S) URLs unchanged and joins relative paths while avoiding a duplicate `/api`.

`vite.config.ts` proxies `/api` to `http://localhost:8080` for dev and preview. Local dev therefore expects a reachable backend on port 8080 unless proxy configuration changes. This proxy is not a production CORS solution. Production using the absolute fallback requires server CORS to allow the deployed frontend origin, Authorization/Content-Type headers, request methods, and preflight OPTIONS.

### Environment variables (names only)

The checked-in environment files contain these names; values are intentionally omitted:

- `.env`: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- `.env.example`: `VITE_ANDROID_APK_URL`
- `.env.production`: `VITE_ANDROID_APK_URL`
- `VITE_API_BASE_URL` is read by the client but was not listed in those checked-in files; it can be supplied by the deploy environment.

Vite exposes `VITE_*` values to client bundles. Never place private/server credentials in them. Cloudinary browser upload depends on configured cloud name and unsigned preset; Android download URL is consumed by the install banner.

### HTTP transport behavior

| Helper | Behavior |
|---|---|
| `fetchJson(path, init, useAuth=true)` | Sets JSON Content-Type and Accept; optionally adds stored Bearer token; parses JSON; throws `ApiError` with status/message; handles 401 and 403 centrally. Auth endpoints pass `false`. |
| `fetchJsonWithToken(path, token, init)` | Explicit-token flow used by `/auth/me`; sets JSON headers and throws for 401/403/non-OK. |
| `uploadFormData(path, formData, method='POST')` | Accept plus optional stored auth; leaves multipart Content-Type to browser; parses JSON and handles expired/unauthorized sessions. |
| `fetchBlob(path, init)` | Optional stored auth; returns Blob; used for downloads. |

There are no Axios interceptors, cookie credentials setting, centralized retries, or shared request cancellation service. Browser fetch defaults apply. Backend CORS, TLS, token validation, deployment routing and cookie behavior cannot be verified from this source.

## 7. Source-confirmed backend request inventory

Appendix B is generated from calls to shared HTTP helpers in API services plus the footer settings read. It records **source call sites**, not unique URLs or verified backend routes. The inventory has **258 helper invocations**: 250 `fetchJson`, 6 `uploadFormData`, 1 `fetchJsonWithToken`, and 1 `fetchBlob`. Four low-level `fetch` expressions inside `apiClient.ts` are transport implementations, not additional endpoint calls.

For every call, the generated row includes HTTP method, URL/path expression, service function/source line, statically detected caller function/file, request body expression, response type annotation and auth handling. Dynamic query/path expressions are retained. A source DTO/type is a frontend expectation, not a backend-confirmed schema.

Common request headers, response parsing, auth and error semantics are documented in section 6. Query parameters appear in path expressions or linked query builders; body expressions are shown without expanding user-provided values. The response type column records the frontend annotation, and the caller column identifies where the returned/normalized value is consumed when a static caller is found; inspect the linked service and caller for field-level usage. Loading/success/empty/error presentation is component-owned, not supplied by the HTTP client. Cart, wishlist and notifications contexts expose loading/error state; other pages vary. No universal UI fallback should be inferred for unconsumed API helpers.

### Business purpose, trigger, and feature-level flow guide

| Feature | Frontend entry points | Service evidence / user action |
|---|---|---|
| Home content | `HomePage`, `Layout`, public banners | `homeApi`, `advertisementApi`, `promotionalBannerApi`, category/search services; homepage load/refresh fetches page data and banner slots. |
| Marketplace search | Header search, `MarketplacePage`, `SearchResultsPage`, customer search flows | `marketplaceSearchApi`, `productApi`, `categoryApi`, `visualSearchApi`, `voiceSearchApi`; typing debounces suggestions, submit navigates to result query, camera/mic have separate actions. |
| Categories | Home/category screens and admin category management | `categoryApi`, `cmsApi`; category list drives navigation/filtering; admin forms mutate categories/fields. |
| Product and seller details | `ProductDetailPage`, `CustomerProductPage`, `SellerProfilePage`, customer seller flows | `productApi`, `sellerApi`, review/wishlist helpers; route IDs select records, image paths may be made absolute. |
| Auctions and bids | Auction list/detail/live/winner/bid flows, vendor auction editor | `auctionApi`, `bidApi`, `vendorAuctionApi`; listing/detail/registration/bid history/bid mutation are separate; some flow state is localStorage. `addMockBid()` is local state, not a backend bid. |
| Cart, checkout, payment | Cart, address/shipping/payment, Buy Now and auction payment screens | `cartApi`, `orderApi`, `paymentApi`, `auctionApi`, `invoiceApi`, Razorpay utility; client initiates and verifies flow but server must be authoritative for amount/status. |
| Orders and delivery | Customer/vendor/admin order screens, tracking and delivery routes | `orderApi`, `vendorOrderApi`, `deliveryShareApi`, `invoiceApi`; `deliveryApi` remains TODO-only. |
| Wallet and withdrawals | Customer/vendor/admin wallet and withdrawal flows | `walletApi`, `customerWalletApi`, `adminWalletApi`, `withdrawalApi`, `paymentApi`; services overlap and require server-side ownership/role checks. |
| Notifications, messages, support | Header action, notifications, chat, support routes | `notificationApi`, `messageApi`, `supportApi`, contexts; unread/read state is context-managed, while page-level integration varies. |
| Offers, rewards and reviews | Customer/vendor/admin offers and customer reward/review flows | `offerApi`, `rewardsApi`, `loyaltyApi`, `reviewApi`, `settingsApi`; discount, balance and eligibility decisions must be server-authoritative. |
| Advertisements and CMS | Public banners; vendor create/manage/pay; franchise/admin review | `advertisementApi`, `promotionalBannerApi`, `cmsApi`; separate visibility, CRUD, payment and approval flows. |
| Admin and franchise | Admin/enterprise/franchise dashboards, reports and resource pages | `adminApi`, `adminSettingsApi`, `adminWalletApi`, `approvalApi`, `contactAdminApi`, `franchiseApi`, `cmsApi`; some helpers dynamically select resource paths. `organizationApi` and `reportApi` contain TODO stubs. |
| Vendor dashboard | Vendor dashboard, profile/KYC, inventory, orders, analytics and ads | `vendorApi`, `vendorDashboardApi`, `vendorProductApi`, `vendorOrderApi`, `vendorRevenueApi`, `vendorVerificationApi`, `vendorAuctionApi`; vendor profile ID aliases are normalized from login/me. |
| Public contact/content | Contact, blog, FAQ, help and policy pages | `contactApi`, `cmsApi`; policy copy is static; CMS-backed pages depend on actual service callers. |

## 8. Dynamic requests, external services, mocks, and incomplete integrations

### Dynamically constructed API requests

Appendix B includes parameterized path expressions. Dynamic cases include record IDs interpolated in route segments; query strings assembled with `URLSearchParams`, pagination/filter/date helpers; generic admin resource helpers accepting a path and appending query values; and absolute media URL normalization. `encodeURIComponent` is applied selectively—inspect each helper before using externally supplied path values. Dynamic expression means source can construct the request; it does not prove server route availability.

### External network calls (not Bidzo backend)

- `src/services/cloudinaryUpload.ts`: multipart POST to a Cloudinary URL assembled from public cloud/preset settings.
- `src/utils/customerLocation.ts`: location search/reverse-geocode fetch to Nominatim; browser connectivity, rate limits, attribution and terms are external.
- `src/components/checkout/DeliveryLocationPicker.tsx`: browser geolocation, OpenStreetMap raster tiles, and the existing Nominatim search/reverse-geocoding utility power the delivery-location picker. No Geoapify key/integration is configured in the frontend environment files; the picker uses no paid mapping API.
- `src/utils/razorpay.ts`: loads Razorpay Checkout script; payment/order calls use Bidzo service adapters where wired.
- `src/pages/extra/FlowPages.tsx`: QR image from `api.qrserver.com`, with a receipt URL encoded in the request.

### Mocks and local-only state

- `src/services/authService.ts` returns fixed `Promise.resolve({ success: true, data: null })` values. This is a mock/demo service; active `AuthContext` uses `src/api/authApi.ts`.
- `src/utils/auctionFlowState.ts` persists auction/buy-now workflow values in localStorage; `addMockBid()` returns local flow state and makes no backend request.
- Static/demo fallback data may exist in individual screens. Only the helper invocations in Appendix B are counted as shared-backend request call sites.

### Placeholder API modules

- `src/api/deliveryApi.ts`: `getDeliveries` and `updateDeliveryStatus` are empty TODO functions.
- `src/api/organizationApi.ts` and `src/api/reportApi.ts`: TODO functions; no request is issued.
- `src/api/vendorApi.ts`: profile/KYC/document operations have request implementations, while `getVendors` and `getVendorById` remain TODO.
- A service module or route existing does not prove its screen uses it; consult Appendix B's caller column.

### Delivery coordinates and sharing (frontend integration)

- Address create/update requests include `latitude` and `longitude`, which are required by the customer address form. The location picker requires explicit confirmation of a searched, browser-derived, or manually map-selected point and never infers coordinates from a postal code. Reverse-geocoded street, locality, city, state, PIN code, and country fields remain editable; customer name and phone are never geocoded.
- Checkout continues to submit the saved `addressId` through the existing cart/auction/payment flow. Order details use the embedded order address snapshot rather than looking up a mutable saved customer address.
- Vendor order requests use `GET /api/vendor/orders?page={page}&size=20`, `GET /api/vendor/orders/{orderId}`, and `PUT /api/vendor/orders/{orderId}/scheduled-delivery-date` with `{ "scheduledDeliveryDate": "YYYY-MM-DD" }`. The UI uses active statuses already present in the frontend (`CONFIRMED`, `PACKING`, `SHIPPED`, `OUT_FOR_DELIVERY`) for scheduling/share controls; backend authorization and eligibility remain authoritative.
- Delivery links use `POST /api/vendor/delivery-shares` for `SINGLE`, `DAY`, and `WEEK` scopes. A single-order request sends `expiresInHours: 48`; the UI displays `shareUrl`, `expiresAt`, `destinationCount`, and `id`/`shareId` when returned, and revokes via `POST /api/vendor/delivery-shares/{shareId}/revoke`.
- `/delivery-share/:token` loads only the scoped public response from `GET /api/public/delivery-shares/{token}` without authentication. It renders an address-field allowlist and directions only when coordinates exist. HTTP `410` is shown as expired; `404` is shown as no longer available (revoked or invalid).
- No vendor share-list endpoint or backend DTO source is present in this frontend repository. Response fields beyond the explicitly supplied `shareUrl` and example requests need confirmation against the backend; the frontend does not construct token URLs or persist/log tokens.

## 9. Integration risks and mismatches

1. No backend contract was supplied. URL, method, DTO, envelope, auth, pagination and error semantics are frontend expectations, not server-verified facts.
2. Login accepts phone but puts it in request field `email`; confirm the backend accepts identifier aliasing.
3. Route guards are client-side UX controls, not endpoint security. Backend must authorize every operation and verify record ownership.
4. Adapters tolerate different envelope shapes (bare arrays, `data`, `content`, API envelopes); backend changes may cause empty normalized data or field mismatches.
5. Dynamic admin path/query helpers mean runtime URLs can differ by caller. Compare browser network traces with backend routing.
6. Overlapping customer/generic wallet and payment initiation services may be distinct or duplicate contracts; reconcile one canonical backend DTO/workflow per resource.
7. AuthContext and UserContext are separate; local auction/payment/registration flags can become stale. Server response must be source of truth.
8. TODO services and local mock flows can render plausible routes without a working API.
9. Production cross-origin API requires CORS for the deployed origin, Authorization and Content-Type headers, methods and OPTIONS preflight.
10. Payment verification must be server-authoritative; unsigned Cloudinary presets, Nominatim and external QR generation have independent security/availability constraints.
11. `fetchJson` throws `ApiError`, but explicit-token/blob and some adapters throw plain `Error`; page error handling may differ.
12. No refresh-token/retry layer was found; test concurrent 401 responses and session expiry.

## 10. Setup, build, tests, and validation

| Task | Command / status |
|---|---|
| Install | `npm ci` (lockfile present) |
| Develop | `npm run dev` (Vite host 0.0.0.0, port 5173) |
| Build | `npm run build` (`tsc && vite build`) |
| Preview | `npm run preview` (Vite preview; `/api` proxy in config targets localhost:8080) |
| Exposed test script | `npm run test:offer-date` (`tsx --test tests/offerDate.test.ts`) |
| Other test files | `tests/androidApkUrl.test.ts`, `tests/buyNowQuantity.test.ts`, `tests/cartQuantity.test.ts`, `tests/deliveryApi.test.ts`, `tests/deliveryValidation.test.ts`, `tests/homeProducts.test.ts`, `tests/passwordResetFlow.test.ts`; no dedicated package script is declared for these in the inspected manifest. |
| Node | Node v24.21.0 was present during inspection. `package.json` does not declare an `engines` range; minimum supported Node version is unspecified. |

The source inventory was produced with a TypeScript AST scan: 286 route declarations and 258 shared HTTP-helper invocations. For the delivery-coordinate/share integration, `npm run build` passed and the existing Buy Now and homepage tests passed (5 tests total). Vite emitted existing warnings about ineffective dynamic imports in `bidApi.ts`, `adminApi.ts`, and `walletApi.ts`, and a minified JavaScript chunk exceeding 500 kB. Remote services and backend endpoints were not validated.

## 11. Recommended integration and testing sequence

1. Obtain backend OpenAPI/Swagger or route/controller definitions; reconcile every frontend path, verb, DTO, response envelope and auth policy.
2. Set `VITE_API_BASE_URL`; configure local proxy and production CORS separately.
3. Contract-test auth login/register/me/OTP/reset first, including phone identifier semantics, token fields, role mapping and OTP channel.
4. For each feature matrix flow, test anonymous/customer/vendor/admin/franchise roles and success, empty, validation, 401, 403, 404, conflict, 5xx, malformed payload and network loss.
5. Capture browser network traces for search, categories, details, bidding, checkout/payment, wallet, notifications, advertisements and admin actions; compare with backend logs.
6. Assert server-authoritative invariants for bids, inventory, checkout totals, discounts, wallet values, withdrawals, order status and payment state.
7. Implement or hide delivery/org/report TODO actions and replace demo/local-only flows before claiming production integration.
8. Add contract tests for duplicate service surfaces and normalize each resource against a canonical backend DTO.
9. Run TypeScript/build and all test files in CI, then exercise narrow mobile/tablet/desktop behavior and camera/voice/payment permissions.

## Appendix A. Generated complete frontend inventories

**File-level inventories**

### src/pages (48)

- `src/pages/AboutPage.tsx`
- `src/pages/AdminDashboardPage.tsx`
- `src/pages/AdminRewardsSettingsPage.tsx`
- `src/pages/AdvertisementPages.tsx`
- `src/pages/AuctionDetailPage.tsx`
- `src/pages/AuctionsPage.tsx`
- `src/pages/AuthPages.tsx`
- `src/pages/BlogPage.tsx`
- `src/pages/ChatPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/CustomerCartPage.tsx`
- `src/pages/CustomerDashboardPage.tsx`
- `src/pages/CustomerOffersPage.tsx`
- `src/pages/CustomerRewardsPage.tsx`
- `src/pages/CustomerWalletPage.tsx`
- `src/pages/DeliveryPage.tsx`
- `src/pages/DeliverySharePage.tsx`
- `src/pages/FAQPage.tsx`
- `src/pages/FranchiseAdminPages.tsx`
- `src/pages/HelpCenterPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/MarketplacePage.tsx`
- `src/pages/NotificationsPage.tsx`
- `src/pages/OffersAdminPage.tsx`
- `src/pages/OnboardingWizard.tsx`
- `src/pages/PolicyPage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/PromotionalBannersAdminPage.tsx`
- `src/pages/SellerProfilePage.tsx`
- `src/pages/VendorDashboardPage.tsx`
- `src/pages/VendorOffersPage.tsx`
- `src/pages/WalletPage.tsx`
- `src/pages/WelcomePages.tsx`
- `src/pages/WishlistPage.tsx`
- `src/pages/admin/AdminApiPages.tsx`
- `src/pages/admin/AdminContactMessagesPage.tsx`
- `src/pages/extra/AdminExtras.tsx`
- `src/pages/extra/AuctionExtras.tsx`
- `src/pages/extra/BuyNowFlowPages.tsx`
- `src/pages/extra/ChatExtras.tsx`
- `src/pages/extra/CustomerVendorExtras.tsx`
- `src/pages/extra/DashboardExtras.tsx`
- `src/pages/extra/EnterpriseAdminPages.tsx`
- `src/pages/extra/ExtraPages.tsx`
- `src/pages/extra/FlowPages.tsx`
- `src/pages/extra/MarketplaceExtras.tsx`
- `src/pages/extra/OrganizationExtras.tsx`
- `src/pages/extra/WalletExtras.tsx`

### src/components (44)

- `src/components/AuctionForm.tsx`
- `src/components/EmptyState.tsx`
- `src/components/Footer.tsx`
- `src/components/Layout.tsx`
- `src/components/Logo.tsx`
- `src/components/ProductForm.tsx`
- `src/components/SectionShell.tsx`
- `src/components/VoiceSearchModal.tsx`
- `src/components/Wizard.tsx`
- `src/components/admin/AdminShell.tsx`
- `src/components/admin/FranchiseAdminShell.tsx`
- `src/components/auction/AuctionComponents.tsx`
- `src/components/cards/MarketplaceCards.tsx`
- `src/components/categories/CategoryIcon.tsx`
- `src/components/chat/ChatComponents.tsx`
- `src/components/checkout/DeliveryAddressSelector.tsx`
- `src/components/checkout/DeliveryLocationPicker.tsx`
- `src/components/checkout/OfferCheckoutSection.tsx`
- `src/components/common/Buttons.tsx`
- `src/components/common/Card.tsx`
- `src/components/common/Feedback.tsx`
- `src/components/common/MarketplaceShell.tsx`
- `src/components/common/OfferPrice.tsx`
- `src/components/common/PageState.tsx`
- `src/components/common/SalesChart.tsx`
- `src/components/common/Shell.tsx`
- `src/components/common/StockBadge.tsx`
- `src/components/common/Table.tsx`
- `src/components/common/Tooltip.tsx`
- `src/components/dashboard/DashboardComponents.tsx`
- `src/components/delivery/DeliveryComponents.tsx`
- `src/components/filters/FilterSidebar.tsx`
- `src/components/forms/FormComponents.tsx`
- `src/components/forms/ImageGalleryField.tsx`
- `src/components/forms/UploadField.tsx`
- `src/components/forms/VideoUploadField.tsx`
- `src/components/layout/LayoutComponents.tsx`
- `src/components/layout/VendorSidebar.tsx`
- `src/components/loading/LoadingComponents.tsx`
- `src/components/marketplace/MarketplaceComponents.tsx`
- `src/components/notifications/NotificationList.tsx`
- `src/components/orders/DeliveryAddressViewer.tsx`
- `src/components/ui/toast.tsx`
- `src/components/wallet/WalletComponents.tsx`

### src/context (9)

- `src/context/AuthContext.tsx`
- `src/context/CartContext.tsx`
- `src/context/LocaleContext.tsx`
- `src/context/NotificationContext.tsx`
- `src/context/ThemeContext.tsx`
- `src/context/UserContext.tsx`
- `src/context/WalletContext.tsx`
- `src/context/WishlistContext.tsx`
- `src/context/index.ts`

### src/hooks (1)

- `src/hooks/useRouteState.ts`

### src/utils (9)

- `src/utils/androidApkUrl.ts`
- `src/utils/auctionFlowState.ts`
- `src/utils/customerLocation.ts`
- `src/utils/formatters.ts`
- `src/utils/homeAuctions.ts`
- `src/utils/orderDisplay.ts`
- `src/utils/razorpay.ts`
- `src/utils/validation.ts`
- `src/utils/vendorKycPublishRestriction.ts`

### src/services (3)

- `src/services/authService.ts`
- `src/services/cloudinaryUpload.ts`
- `src/services/productOfferService.ts`

### src/api (51)

| Module | Observed purpose |
|---|---|
| `addressApi.ts` | Customer address CRUD |
| `adminApi.ts` | Admin resource operations and reports |
| `adminSettingsApi.ts` | Admin settings and OTP delivery preferences |
| `adminWalletApi.ts` | Admin wallet/withdrawal management |
| `advertisementApi.ts` | Public and role-specific advertisements, approvals and payment |
| `apiClient.ts` | Shared HTTP/base URL/auth/error transport |
| `approvalApi.ts` | Admin vendor approval workflow |
| `auctionApi.ts` | Auction operations, images, registrations and payments |
| `authApi.ts` | Login, registration, OTP and password reset |
| `bidApi.ts` | Auction bid operations |
| `cartApi.ts` | Cart and checkout initiation |
| `categoryApi.ts` | Categories and category fields |
| `cmsApi.ts` | Content-management operations and public CMS reads |
| `contactAdminApi.ts` | Admin contact-message actions |
| `contactApi.ts` | Public contact submission |
| `customerApi.ts` | Customer profile/dashboard |
| `customerWalletApi.ts` | Customer wallet |
| `deliveryApi.ts` | TODO placeholder |
| `deliveryShareApi.ts` | Vendor delivery-share creation/revocation and public share lookup |
| `franchiseApi.ts` | Franchise operations |
| `homeApi.ts` | Homepage data/deals |
| `invoiceApi.ts` | Invoice retrieval/download |
| `loyaltyApi.ts` | Loyalty operations |
| `marketplaceSearchApi.ts` | Marketplace search |
| `mediaApi.ts` | Backend media upload |
| `messageApi.ts` | Conversation/message operations |
| `notificationApi.ts` | Notifications and read actions |
| `offerApi.ts` | Offers/coupons |
| `orderApi.ts` | Customer order operations |
| `organizationApi.ts` | TODO placeholder |
| `paymentApi.ts` | Payment creation/verification |
| `productApi.ts` | Product and product-image operations |
| `promotionalBannerApi.ts` | Promotional banners |
| `reportApi.ts` | TODO placeholder |
| `reviewApi.ts` | Product reviews |
| `rewardsApi.ts` | Rewards |
| `sellerApi.ts` | Public seller profiles |
| `settingsApi.ts` | Customer settings |
| `supportApi.ts` | Support tickets |
| `vendorApi.ts` | Vendor profile/KYC/documents; some TODO functions |
| `vendorAuctionApi.ts` | Vendor auction operations |
| `vendorDashboardApi.ts` | Vendor dashboard |
| `vendorOrderApi.ts` | Vendor order operations |
| `vendorProductApi.ts` | Vendor products/inventory |
| `vendorRevenueApi.ts` | Vendor revenue |
| `vendorVerificationApi.ts` | Vendor verification |
| `visualSearchApi.ts` | Visual search |
| `voiceSearchApi.ts` | Voice search |
| `walletApi.ts` | Customer wallet/transactions |
| `wishlistApi.ts` | Customer wishlist |
| `withdrawalApi.ts` | Withdrawal operations |

### Root frontend support files

- `src/App.tsx`
- `src/counter.ts`
- `src/index.css`
- `src/main`
- `src/main.ts`
- `src/main.tsx`
- `src/style.css`

## Appendix B. Generated source-level backend call-site catalog

**252 helper call sites.**

| # | Method | URL/path expression | Service function and source | Static caller(s) | Body | Response type | Authentication |
|---:|---|---|---|---|---|---|---|
| 1 | `GET` | `'/api/customer/addresses'` | `getAddresses` at [src/api/addressApi.ts:61](../src/api/addressApi.ts#L61) | src/components/checkout/DeliveryAddressSelector.tsx :: addAddress<br>src/components/checkout/DeliveryAddressSelector.tsx :: loadAddresses<br>src/pages/AuctionDetailPage.tsx :: loadSavedAddress<br>src/pages/extra/CustomerVendorExtras.tsx :: createProfileAddress<br>src/pages/extra/CustomerVendorExtras.tsx :: loadAddresses | `none` | `ApiResponse<AddressResponse[]>` | Optional auth from local storage |
| 2 | `GET` | ``/api/customer/addresses/paginated?page=${page}&pageSize=${pageSize}`` | `getAddressesPaginated` at [src/api/addressApi.ts:71](../src/api/addressApi.ts#L71) | No static caller found | `none` | `ApiResponse<{ data: AddressResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 3 | `GET` | ``/api/customer/addresses/${addressId}`` | `getAddressById` at [src/api/addressApi.ts:81](../src/api/addressApi.ts#L81) | src/components/orders/DeliveryAddressViewer.tsx :: DeliveryAddressViewer<br>src/pages/extra/CustomerVendorExtras.tsx :: loadOrder | `none` | `ApiResponse<AddressResponse>` | Optional auth from local storage |
| 4 | `POST` | `'/api/customer/addresses'` | `createAddress` at [src/api/addressApi.ts:91](../src/api/addressApi.ts#L91) | src/components/checkout/DeliveryAddressSelector.tsx :: addAddress<br>src/pages/extra/CustomerVendorExtras.tsx :: createProfileAddress<br>src/pages/extra/CustomerVendorExtras.tsx :: handleSave | `JSON.stringify(payload)` | `ApiResponse<AddressResponse>` | Optional auth from local storage |
| 5 | `PUT` | ``/api/customer/addresses/${addressId}`` | `updateAddress` at [src/api/addressApi.ts:102](../src/api/addressApi.ts#L102) | src/pages/extra/CustomerVendorExtras.tsx :: handleSave | `JSON.stringify(payload)` | `ApiResponse<AddressResponse>` | Optional auth from local storage |
| 6 | `PUT` | ``/api/customer/addresses/${addressId}/default`` | `setDefaultAddress` at [src/api/addressApi.ts:113](../src/api/addressApi.ts#L113) | No static caller found | `none` | `ApiResponse<AddressResponse>` | Optional auth from local storage |
| 7 | `DELETE` | ``/api/customer/addresses/${addressId}`` | `deleteAddress` at [src/api/addressApi.ts:123](../src/api/addressApi.ts#L123) | src/pages/extra/CustomerVendorExtras.tsx :: handleDelete | `none` | `ApiResponse<void>` | Optional auth from local storage |
| 8 | `GET` | ``${path}${queryString(query)}`` | `list` at [src/api/adminApi.ts:82](../src/api/adminApi.ts#L82) | No static caller found | `none` | `T[] \| ApiEnvelope<T[]>` | Optional auth from local storage |
| 9 | `GET` | ``${path}${queryString({ ...query, page, pageSize })}`` | `paginated` at [src/api/adminApi.ts:89](../src/api/adminApi.ts#L89) | No static caller found | `none` | `unknown` | Optional auth from local storage |
| 10 | `GET` | `path` | `detail` at [src/api/adminApi.ts:107](../src/api/adminApi.ts#L107) | No static caller found | `none` | `T \| ApiEnvelope<T>` | Optional auth from local storage |
| 11 | `GET` | ``/api/admin/customers/paginated?${params.toString()}`` | `getAdminCustomersPaginated` at [src/api/adminApi.ts:124](../src/api/adminApi.ts#L124) | src/pages/admin/AdminApiPages.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 12 | `PUT` | ``/api/admin/customers/${userId}/activate`` | `activateAdminCustomer` at [src/api/adminApi.ts:133](../src/api/adminApi.ts#L133) | src/pages/admin/AdminApiPages.tsx :: AdminResourcePage | `none` | `AdminRecord` | Optional auth from local storage |
| 13 | `PUT` | ``/api/admin/customers/${userId}/deactivate`` | `deactivateAdminCustomer` at [src/api/adminApi.ts:134](../src/api/adminApi.ts#L134) | src/pages/admin/AdminApiPages.tsx :: AdminResourcePage | `none` | `AdminRecord` | Optional auth from local storage |
| 14 | `POST` | `'/api/admin/franchise-admins'` | `createFranchiseAdmin` at [src/api/adminApi.ts:142](../src/api/adminApi.ts#L142) | src/pages/extra/EnterpriseAdminPages.tsx :: submit | `JSON.stringify(payload)` | `AdminRecord \| ApiEnvelope<AdminRecord>` | Optional auth from local storage |
| 15 | `PUT` | ``/api/admin/franchises/${encodeURIComponent(String(franchiseId))}/admin`` | `assignFranchiseAdmin` at [src/api/adminApi.ts:143](../src/api/adminApi.ts#L143) | src/pages/extra/EnterpriseAdminPages.tsx :: submit | `JSON.stringify({ adminUserId })` | `AdminRecord \| ApiEnvelope<AdminRecord>` | Optional auth from local storage |
| 16 | `POST` | `'/api/admin/franchises'` | `createAdminFranchise` at [src/api/adminApi.ts:144](../src/api/adminApi.ts#L144) | src/pages/extra/EnterpriseAdminPages.tsx :: submit | `JSON.stringify(payload)` | `AdminRecord \| ApiEnvelope<AdminRecord>` | Optional auth from local storage |
| 17 | `PUT` | ``/api/admin/vendors/${userId}/activate`` | `activateAdminVendor` at [src/api/adminApi.ts:146](../src/api/adminApi.ts#L146) | src/pages/admin/AdminApiPages.tsx :: updateVendorStatus | `none` | `AdminRecord` | Optional auth from local storage |
| 18 | `PUT` | ``/api/admin/vendors/${userId}/deactivate`` | `deactivateAdminVendor` at [src/api/adminApi.ts:147](../src/api/adminApi.ts#L147) | src/pages/admin/AdminApiPages.tsx :: updateVendorStatus | `none` | `AdminRecord` | Optional auth from local storage |
| 19 | `PATCH` | ``/api/admin/orders/${id}/status`` | `updateAdminOrderStatus` at [src/api/adminApi.ts:167](../src/api/adminApi.ts#L167) | src/pages/admin/AdminApiPages.tsx :: updateOrderStatus<br>src/pages/admin/AdminApiPages.tsx :: updateStatus | `JSON.stringify({ status })` | `AdminRecord \| ApiEnvelope<AdminRecord>` | Optional auth from local storage |
| 20 | `PUT` | ``/api/admin/products/${id}/status`` | `updateAdminProductStatus` at [src/api/adminApi.ts:175](../src/api/adminApi.ts#L175) | src/pages/admin/AdminApiPages.tsx :: updateStatus | `JSON.stringify({ status })` | `AdminRecord \| ApiEnvelope<AdminRecord>` | Optional auth from local storage |
| 21 | `GET` | `path` | `getSetting` at [src/api/adminSettingsApi.ts:61](../src/api/adminSettingsApi.ts#L61) | No static caller found | `none` | `AdminSettingRecord \| ApiEnvelope<AdminSettingRecord>` | Optional auth from local storage |
| 22 | `PUT` | `path` | `updateSetting` at [src/api/adminSettingsApi.ts:68](../src/api/adminSettingsApi.ts#L68) | No static caller found | `JSON.stringify(payload)` | `AdminSettingRecord \| ApiEnvelope<AdminSettingRecord>` | Optional auth from local storage |
| 23 | `GET` | `'/api/admin/settings/get-rewards'` | `getAdminRewardsSettings` at [src/api/adminSettingsApi.ts:144](../src/api/adminSettingsApi.ts#L144) | src/pages/AdminRewardsSettingsPage.tsx :: load | `none` | `ApiEnvelope<RewardsSettings>` | Optional auth from local storage |
| 24 | `PUT` | `'/api/admin/settings/rewards'` | `updateAdminRewardsSettings` at [src/api/adminSettingsApi.ts:151](../src/api/adminSettingsApi.ts#L151) | src/pages/AdminRewardsSettingsPage.tsx :: save | `JSON.stringify(payload)` | `ApiEnvelope<RewardsSettings>` | Optional auth from local storage |
| 25 | `GET` | `'/api/admin/settings/notification-templates'` | `getAdminNotificationTemplates` at [src/api/adminSettingsApi.ts:208](../src/api/adminSettingsApi.ts#L208) | src/pages/extra/EnterpriseAdminPages.tsx :: loadTemplates | `none` | `NotificationTemplate[] \| ApiEnvelope<NotificationTemplate[]>` | Optional auth from local storage |
| 26 | `POST` | `'/api/admin/settings/notification-templates'` | `createAdminNotificationTemplate` at [src/api/adminSettingsApi.ts:221](../src/api/adminSettingsApi.ts#L221) | src/pages/extra/EnterpriseAdminPages.tsx :: handleCreateTemplate | `JSON.stringify(payload)` | `NotificationTemplate \| ApiEnvelope<NotificationTemplate>` | Optional auth from local storage |
| 27 | `PUT` | ``/api/admin/settings/notification-templates/${encodeURIComponent(id)}`` | `updateAdminNotificationTemplate` at [src/api/adminSettingsApi.ts:226](../src/api/adminSettingsApi.ts#L226) | No static caller found | `JSON.stringify(payload)` | `NotificationTemplate \| ApiEnvelope<NotificationTemplate>` | Optional auth from local storage |
| 28 | `DELETE` | ``/api/admin/settings/notification-templates/${encodeURIComponent(id)}`` | `deleteAdminNotificationTemplate` at [src/api/adminSettingsApi.ts:231](../src/api/adminSettingsApi.ts#L231) | src/pages/extra/EnterpriseAdminPages.tsx :: handleDeleteTemplate | `none` | `inferred/unknown` | Optional auth from local storage |
| 29 | `GET` | `'/api/admin/wallet/summary'` | `getAdminWalletSummary` at [src/api/adminWalletApi.ts:75](../src/api/adminWalletApi.ts#L75) | src/pages/extra/EnterpriseAdminPages.tsx :: loadWallet | `none` | `AdminWalletSummary \| ApiEnvelope<AdminWalletSummary>` | Optional auth from local storage |
| 30 | `GET` | `'/api/admin/wallet/transactions'` | `getAdminWalletTransactions` at [src/api/adminWalletApi.ts:80](../src/api/adminWalletApi.ts#L80) | src/pages/extra/EnterpriseAdminPages.tsx :: loadWallet | `none` | `unknown` | Optional auth from local storage |
| 31 | `GET` | `'/api/admin/withdrawals/pending'` | `getPendingAdminWithdrawals` at [src/api/adminWalletApi.ts:85](../src/api/adminWalletApi.ts#L85) | src/pages/extra/EnterpriseAdminPages.tsx :: loadPendingWithdrawals<br>src/pages/extra/EnterpriseAdminPages.tsx :: loadWithdrawals | `none` | `unknown` | Optional auth from local storage |
| 32 | `GET` | ``/api/admin/withdrawals/${id}`` | `getAdminWithdrawal` at [src/api/adminWalletApi.ts:90](../src/api/adminWalletApi.ts#L90) | No static caller found | `none` | `AdminWithdrawal \| ApiEnvelope<AdminWithdrawal>` | Optional auth from local storage |
| 33 | `PUT` | ``/api/admin/withdrawals/${id}/${action}`` | `updateWithdrawal` at [src/api/adminWalletApi.ts:95](../src/api/adminWalletApi.ts#L95) | No static caller found | `none` | `AdminWithdrawal \| ApiEnvelope<AdminWithdrawal>` | Optional auth from local storage |
| 34 | `GET` | `path` | `getPublicAdvertisements` at [src/api/advertisementApi.ts:30](../src/api/advertisementApi.ts#L30) | No static caller found | `none` | `PublicAdvertisementEnvelope \| PublicAdvertisementResponse[]` | Unauthenticated |
| 35 | `GET` | `'/api/vendor/advertisements'` | `getVendorAdvertisements` at [src/api/advertisementApi.ts:285](../src/api/advertisementApi.ts#L285) | src/pages/AdvertisementPages.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 36 | `GET` | ``/api/vendor/advertisements/${encodeURIComponent(String(id))}`` | `getVendorAdvertisement` at [src/api/advertisementApi.ts:292](../src/api/advertisementApi.ts#L292) | src/pages/AdvertisementPages.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 37 | `POST` | `'/api/vendor/advertisements'` | `createVendorAdvertisement` at [src/api/advertisementApi.ts:308](../src/api/advertisementApi.ts#L308) | src/pages/AdvertisementPages.tsx :: handleSubmit | `JSON.stringify(cleaned)` | `unknown` | Optional auth from local storage |
| 38 | `PUT` | ``/api/vendor/advertisements/${encodeURIComponent(String(id))}`` | `updateVendorAdvertisement` at [src/api/advertisementApi.ts:326](../src/api/advertisementApi.ts#L326) | No static caller found | `JSON.stringify(cleaned)` | `unknown` | Optional auth from local storage |
| 39 | `GET` | `'/api/franchise/advertisements'` | `getFranchiseAdvertisements` at [src/api/advertisementApi.ts:336](../src/api/advertisementApi.ts#L336) | src/pages/AdvertisementPages.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 40 | `GET` | ``/api/franchise/advertisements/${encodeURIComponent(String(id))}`` | `getFranchiseAdvertisement` at [src/api/advertisementApi.ts:343](../src/api/advertisementApi.ts#L343) | src/pages/AdvertisementPages.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 41 | `POST` | ``/api/franchise/advertisements/${encodeURIComponent(String(id))}/approve`` | `approveFranchiseAdvertisement` at [src/api/advertisementApi.ts:350](../src/api/advertisementApi.ts#L350) | src/pages/AdvertisementPages.tsx :: FranchiseAdvertisementDetailPage<br>src/pages/AdvertisementPages.tsx :: FranchiseAdvertisementPage | `none` | `unknown` | Optional auth from local storage |
| 42 | `POST` | ``/api/franchise/advertisements/${encodeURIComponent(String(id))}/reject`` | `rejectFranchiseAdvertisement` at [src/api/advertisementApi.ts:357](../src/api/advertisementApi.ts#L357) | src/pages/AdvertisementPages.tsx :: FranchiseAdvertisementDetailPage<br>src/pages/AdvertisementPages.tsx :: FranchiseAdvertisementPage | `JSON.stringify({ reason })` | `unknown` | Optional auth from local storage |
| 43 | `GET` | `'/api/admin/advertisements'` | `getAdminAdvertisements` at [src/api/advertisementApi.ts:367](../src/api/advertisementApi.ts#L367) | src/pages/AdvertisementPages.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 44 | `GET` | `'/api/admin/advertisement-pricing'` | `getAdminAdvertisementPricing` at [src/api/advertisementApi.ts:374](../src/api/advertisementApi.ts#L374) | src/pages/AdvertisementPages.tsx :: loadPricing | `none` | `unknown` | Optional auth from local storage |
| 45 | `PUT` | ``/api/admin/advertisement-pricing/${encodeURIComponent(type)}`` | `updateAdminAdvertisementPricing` at [src/api/advertisementApi.ts:379](../src/api/advertisementApi.ts#L379) | src/pages/AdvertisementPages.tsx :: savePricing | `JSON.stringify({ pricePerDay })` | `unknown` | Optional auth from local storage |
| 46 | `GET` | ``/api/admin/advertisements/${encodeURIComponent(String(id))}`` | `getAdminAdvertisement` at [src/api/advertisementApi.ts:388](../src/api/advertisementApi.ts#L388) | src/pages/AdvertisementPages.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 47 | `POST` | ``/api/admin/advertisements/${encodeURIComponent(String(id))}/approve-publishing`` | `approveAdminAdvertisement` at [src/api/advertisementApi.ts:395](../src/api/advertisementApi.ts#L395) | src/pages/AdvertisementPages.tsx :: AdminAdvertisementDetailPage | `none` | `unknown` | Optional auth from local storage |
| 48 | `POST` | ``/api/admin/advertisements/${encodeURIComponent(String(id))}/reject-publishing`` | `rejectAdminAdvertisement` at [src/api/advertisementApi.ts:402](../src/api/advertisementApi.ts#L402) | src/pages/AdvertisementPages.tsx :: AdminAdvertisementDetailPage | `JSON.stringify({ reason })` | `unknown` | Optional auth from local storage |
| 49 | `POST` | ``/api/admin/advertisements/${encodeURIComponent(String(id))}/publish`` | `publishAdminAdvertisement` at [src/api/advertisementApi.ts:412](../src/api/advertisementApi.ts#L412) | src/pages/AdvertisementPages.tsx :: AdminAdvertisementDetailPage | `none` | `unknown` | Optional auth from local storage |
| 50 | `POST` | ``/api/vendor/advertisements/${encodeURIComponent(String(id))}/payments/razorpay`` | `createAdvertisementRazorpayOrder` at [src/api/advertisementApi.ts:422](../src/api/advertisementApi.ts#L422) | src/pages/AdvertisementPages.tsx :: pay<br>src/pages/AdvertisementPages.tsx :: startPayment | `JSON.stringify({ paymentProvider: String(payload.paymentProvider ?? 'RAZORPAY'), })` | `unknown` | Optional auth from local storage |
| 51 | `POST` | ``/api/vendor/advertisements/${encodeURIComponent(String(id))}/payment`` | `verifyAdvertisementPayment` at [src/api/advertisementApi.ts:442](../src/api/advertisementApi.ts#L442) | src/pages/AdvertisementPages.tsx :: pay<br>src/pages/AdvertisementPages.tsx :: startPayment | `JSON.stringify({ paymentProvider: String(payload.paymentProvider ?? 'RAZORPAY'), paymentReference: reasonValue, amount: amountValue, currency: currencyValue, razorpayPaymentId: payload.razorpayPaymentId, razorpayOrderId: payload.razorpayOrderId, paymentSignature: payload.paymentSignature, })` | `unknown` | Optional auth from local storage |
| 52 | `POST` | ``/api/admin/vendors/${id}/request-changes`` | `requestVendorChanges` at [src/api/approvalApi.ts:264](../src/api/approvalApi.ts#L264) | src/pages/extra/EnterpriseAdminPages.tsx :: handleRequestChanges | `JSON.stringify(payload)` | `void \| ApprovalEnvelope<void>` | Optional auth from local storage |
| 53 | `PUT` | ``/api/admin/vendors/${id}/${action}`` | `updateVendorApproval` at [src/api/approvalApi.ts:272](../src/api/approvalApi.ts#L272) | No static caller found | `none` | `void \| ApprovalEnvelope<void>` | Optional auth from local storage |
| 54 | `POST` | ``/api/auctions/${auctionId}/payments/razorpay?addressId=${encodeURIComponent(addressId)}`` | `createAuctionRazorpayPayment` at [src/api/auctionApi.ts:12](../src/api/auctionApi.ts#L12) | src/pages/AuctionDetailPage.tsx :: handlePayNow | `none` | `ApiResponse<RazorpayOrderResponse>` | Optional auth from local storage |
| 55 | `POST` | ``/api/auctions/${auctionId}/payments/razorpay/verify?orderId=${encodeURIComponent(internalOrderId)}`` | `verifyAuctionRazorpayPayment` at [src/api/auctionApi.ts:18](../src/api/auctionApi.ts#L18) | src/pages/AuctionDetailPage.tsx :: handlePaymentVerification | `JSON.stringify(request)` | `ApiResponse<PaymentResponseDto>` | Optional auth from local storage |
| 56 | `GET` | ``/api/products/${productId}/images`` | `getProductImages` at [src/api/auctionApi.ts:252](../src/api/auctionApi.ts#L252) | src/pages/AuctionDetailPage.tsx :: loadAuction | `none` | `ApiResponse<ProductImageResponse[]>` | Unauthenticated |
| 57 | `GET` | `'/api/auctions'` | `getAuctions` at [src/api/auctionApi.ts:389](../src/api/auctionApi.ts#L389) | src/pages/AuctionsPage.tsx :: loadAuctions<br>src/pages/HomePage.tsx :: load<br>src/pages/extra/AuctionExtras.tsx :: AuctionListPage<br>src/pages/extra/FlowPages.tsx :: loadRuntimeAuction<br>src/pages/extra/FlowPages.tsx :: syncRuntimeAuction | `none` | `ApiResponse<AuctionResponse[]>` | Unauthenticated |
| 58 | `POST` | `'/api/auctions'` | `createAuction` at [src/api/auctionApi.ts:453](../src/api/auctionApi.ts#L453) | src/pages/extra/FlowPages.tsx :: handlePublish | `formData` | `ApiResponse<AuctionResponse>` | Optional auth from local storage |
| 59 | `GET` | ``/api/auctions/${auctionId}`` | `getAuctionById` at [src/api/auctionApi.ts:474](../src/api/auctionApi.ts#L474) | src/pages/AuctionDetailPage.tsx :: loadAuction<br>src/pages/AuctionDetailPage.tsx :: pollAuctionState<br>src/pages/extra/CustomerVendorExtras.tsx :: VendorEditAuctionPage<br>src/pages/extra/CustomerVendorExtras.tsx :: fetchAuctionDetails<br>src/pages/extra/CustomerVendorExtras.tsx :: loadWonAuctions | `none` | `ApiResponse<AuctionResponse>` | Unauthenticated |
| 60 | `GET` | ``/api/auctions/${auctionId}/images`` | `getAuctionImages` at [src/api/auctionApi.ts:497](../src/api/auctionApi.ts#L497) | src/pages/AuctionDetailPage.tsx :: loadAuction | `none` | `ApiResponse<AuctionImageResponse[]>` | Unauthenticated |
| 61 | `GET` | ``/api/auctions/${auctionId}/winner`` | `getAuctionWinner` at [src/api/auctionApi.ts:520](../src/api/auctionApi.ts#L520) | src/pages/AuctionDetailPage.tsx :: loadAuction<br>src/pages/AuctionsPage.tsx :: loadAuctions<br>src/pages/extra/CustomerVendorExtras.tsx :: fetchWinner<br>src/pages/extra/CustomerVendorExtras.tsx :: loadWonAuctions | `none` | `ApiResponse<AuctionWinnerResponse>` | Unauthenticated |
| 62 | `GET` | ``/api/auctions/${auctionId}/registration`` | `getAuctionRegistrationStatus` at [src/api/auctionApi.ts:543](../src/api/auctionApi.ts#L543) | src/pages/AuctionDetailPage.tsx :: loadRegistrationStatus<br>src/pages/extra/CustomerVendorExtras.tsx :: fetchRegistrationStatus | `none` | `ApiResponse<AuctionRegistrationStatusResponse>` | Optional auth from local storage |
| 63 | `POST` | ``/api/auctions/${auctionId}/registration/payment`` | `createAuctionRegistrationPayment` at [src/api/auctionApi.ts:565](../src/api/auctionApi.ts#L565) | src/pages/AuctionDetailPage.tsx :: handleRegisterNow | `none` | `ApiResponse<RazorpayOrderResponse>` | Optional auth from local storage |
| 64 | `POST` | ``/api/auctions/${auctionId}/registration/payment/verify`` | `verifyAuctionRegistrationPayment` at [src/api/auctionApi.ts:588](../src/api/auctionApi.ts#L588) | src/pages/AuctionDetailPage.tsx :: handleRegistrationVerification | `JSON.stringify(request)` | `ApiResponse<PaymentResponseDto>` | Optional auth from local storage |
| 65 | `PUT` | ``/api/auctions/${auctionId}`` | `updateAuction` at [src/api/auctionApi.ts:652](../src/api/auctionApi.ts#L652) | src/pages/extra/CustomerVendorExtras.tsx :: saveAuctionVideo | `formData` | `ApiResponse<AuctionResponse>` | Optional auth from local storage |
| 66 | `DELETE` | ``/api/auctions/${auctionId}/images/${imageId}`` | `deleteAuctionImage` at [src/api/auctionApi.ts:658](../src/api/auctionApi.ts#L658) | No static caller found | `none` | `ApiResponse<unknown>` | Optional auth from local storage |
| 67 | `PUT` | ``/api/auctions/${auctionId}/images/${imageId}/primary`` | `setAuctionPrimaryImage` at [src/api/auctionApi.ts:663](../src/api/auctionApi.ts#L663) | No static caller found | `none` | `ApiResponse<unknown>` | Optional auth from local storage |
| 68 | `POST` | `'/auth/register'` | `register` at [src/api/authApi.ts:144](../src/api/authApi.ts#L144) | src/context/AuthContext.tsx :: registerCustomer<br>src/context/AuthContext.tsx :: registerVendor | `JSON.stringify(payload)` | `ApiResponse<AuthRegisterResponse> \| null` | Unauthenticated |
| 69 | `POST` | `path` | `postAuthAction` at [src/api/authApi.ts:255](../src/api/authApi.ts#L255) | No static caller found | `JSON.stringify(payload)` | `ApiResponse<unknown> \| null` | Unauthenticated |
| 70 | `POST` | `'/auth/login'` | `login` at [src/api/authApi.ts:312](../src/api/authApi.ts#L312) | src/context/AuthContext.tsx :: login | `JSON.stringify(payload)` | `ApiResponse<AuthLoginResponse>` | Unauthenticated |
| 71 | `GET` | `'/auth/me'` | `authMe` at [src/api/authApi.ts:353](../src/api/authApi.ts#L353) | src/context/AuthContext.tsx :: login | `none` | `ApiResponse<AuthMeResponse>` | Explicit token |
| 72 | `GET` | ``/api/auctions/${auctionId}/bids`` | `getAuctionBids` at [src/api/bidApi.ts:24](../src/api/bidApi.ts#L24) | src/pages/AuctionDetailPage.tsx :: loadAuction<br>src/pages/AuctionDetailPage.tsx :: pollAuctionState<br>src/pages/extra/CustomerVendorExtras.tsx :: fetchBids | `none` | `ApiResponse<BidResponse[]>` | Optional auth from local storage |
| 73 | `GET` | ``/api/bids/${id}`` | `getBidById` at [src/api/bidApi.ts:37](../src/api/bidApi.ts#L37) | No static caller found | `none` | `ApiResponse<BidResponse>` | Optional auth from local storage |
| 74 | `GET` | ``/api/customer/bids`` | `getMyBids` at [src/api/bidApi.ts:50](../src/api/bidApi.ts#L50) | src/pages/extra/CustomerVendorExtras.tsx :: CustomerAuctionsPage<br>src/pages/extra/CustomerVendorExtras.tsx :: loadBids<br>src/pages/extra/CustomerVendorExtras.tsx :: loadWonAuctions | `none` | `ApiResponse<BidResponse[]>` | Optional auth from local storage |
| 75 | `POST` | ``/api/auctions/${auctionId}/bids`` | `placeBid` at [src/api/bidApi.ts:66](../src/api/bidApi.ts#L66) | src/pages/AuctionDetailPage.tsx :: handlePlaceBid<br>src/pages/extra/CustomerVendorExtras.tsx :: handlePlaceBid | `JSON.stringify({ amount: amount.toString(), })` | `ApiResponse<BidResponse>` | Optional auth from local storage |
| 76 | `GET` | `'/api/cart'` | `getCart` at [src/api/cartApi.ts:45](../src/api/cartApi.ts#L45) | src/context/CartContext.tsx :: refresh | `none` | `ApiResponse<any>` | Optional auth from local storage |
| 77 | `POST` | `'/api/cart/items'` | `addCartItem` at [src/api/cartApi.ts:51](../src/api/cartApi.ts#L51) | src/context/CartContext.tsx :: addItem | `JSON.stringify({ productId, quantity })` | `ApiResponse<any>` | Optional auth from local storage |
| 78 | `PUT` | ``/api/cart/items/${encodeURIComponent(itemId)}`` | `updateCartItem` at [src/api/cartApi.ts:57](../src/api/cartApi.ts#L57) | src/context/CartContext.tsx :: updateItem | `JSON.stringify({ quantity })` | `ApiResponse<any>` | Optional auth from local storage |
| 79 | `DELETE` | ``/api/cart/items/${encodeURIComponent(itemId)}`` | `removeCartItem` at [src/api/cartApi.ts:63](../src/api/cartApi.ts#L63) | src/context/CartContext.tsx :: removeItem | `none` | `ApiResponse<any>` | Optional auth from local storage |
| 80 | `POST` | `'/api/cart/checkout'` | `createCartCheckout` at [src/api/cartApi.ts:69](../src/api/cartApi.ts#L69) | src/pages/CustomerCartPage.tsx :: handleCheckout | `JSON.stringify({ addressId, ...(offerId !== undefined :: { offerId } : {}), ...(couponCode?.trim() :: { couponCode: couponCode.trim() } : {}) })` | `ApiResponse<RazorpayOrderResponse>` | Optional auth from local storage |
| 81 | `GET` | `'/api/categories/list'` | `getCategories` at [src/api/categoryApi.ts:141](../src/api/categoryApi.ts#L141) | src/components/Layout.tsx :: Layout<br>src/pages/AdvertisementPages.tsx :: VendorAdvertisementCreatePage<br>src/pages/MarketplacePage.tsx :: MarketplacePage<br>src/pages/VendorOffersPage.tsx :: VendorOffersPage<br>src/pages/extra/EnterpriseAdminPages.tsx :: loadItems<br>src/pages/extra/FlowPages.tsx :: VendorCreateProductWizardPage<br>src/pages/extra/FlowPages.tsx :: VendorEditProductWizardPage<br>src/pages/extra/MarketplaceExtras.tsx :: CategoriesPage<br>src/pages/extra/MarketplaceExtras.tsx :: SearchResultsPage<br>src/pages/extra/MarketplaceExtras.tsx :: SubCategoriesPage | `none` | `unknown` | Unauthenticated |
| 82 | `POST` | `'/api/categories'` | `createCategory` at [src/api/categoryApi.ts:157](../src/api/categoryApi.ts#L157) | src/pages/extra/EnterpriseAdminPages.tsx :: handleCreate | `JSON.stringify(payload)` | `CategoryRecord \| CategoryEnvelope<CategoryRecord>` | Optional auth from local storage |
| 83 | `PUT` | ``/api/categories/${encodeURIComponent(id)}`` | `updateCategory` at [src/api/categoryApi.ts:165](../src/api/categoryApi.ts#L165) | src/pages/extra/EnterpriseAdminPages.tsx :: handleUpdate | `JSON.stringify(payload)` | `CategoryRecord \| CategoryEnvelope<CategoryRecord>` | Optional auth from local storage |
| 84 | `DELETE` | ``/api/categories/${encodeURIComponent(id)}`` | `deleteCategory` at [src/api/categoryApi.ts:171](../src/api/categoryApi.ts#L171) | src/pages/extra/EnterpriseAdminPages.tsx :: handleDelete | `none` | `unknown` | Optional auth from local storage |
| 85 | `PUT` | ``/api/categories/${encodeURIComponent(id)}`` | `updateCategoryFeatured` at [src/api/categoryApi.ts:176](../src/api/categoryApi.ts#L176) | src/pages/extra/EnterpriseAdminPages.tsx :: handleFeaturedToggle | `JSON.stringify({ featured })` | `CategoryRecord \| CategoryEnvelope<CategoryRecord>` | Optional auth from local storage |
| 86 | `GET` | ``/api/categories/${encodeURIComponent(id)}`` | `getCategory` at [src/api/categoryApi.ts:182](../src/api/categoryApi.ts#L182) | No static caller found | `none` | `CategoryRecord \| CategoryEnvelope<CategoryRecord>` | Optional auth from local storage |
| 87 | `GET` | ``/api/categories/${encodeURIComponent(categoryId)}/fields`` | `getCategoryFields` at [src/api/categoryApi.ts:186](../src/api/categoryApi.ts#L186) | src/pages/extra/EnterpriseAdminPages.tsx :: CMSCategoriesPage<br>src/pages/extra/EnterpriseAdminPages.tsx :: loadFields<br>src/pages/extra/FlowPages.tsx :: VendorCreateProductWizardPage<br>src/pages/extra/FlowPages.tsx :: VendorEditProductWizardPage | `none` | `unknown` | Optional auth from local storage |
| 88 | `POST` | ``/api/categories/${encodeURIComponent(categoryId)}/fields`` | `createCategoryField` at [src/api/categoryApi.ts:193](../src/api/categoryApi.ts#L193) | src/pages/extra/EnterpriseAdminPages.tsx :: handleFieldSave | `JSON.stringify(data)` | `CategoryFieldDefinition \| CategoryEnvelope<CategoryFieldDefinition>` | Optional auth from local storage |
| 89 | `PUT` | ``/api/categories/${encodeURIComponent(categoryId)}/fields/${encodeURIComponent(fieldId)}`` | `updateCategoryField` at [src/api/categoryApi.ts:198](../src/api/categoryApi.ts#L198) | src/pages/extra/EnterpriseAdminPages.tsx :: handleFieldSave | `JSON.stringify(data)` | `CategoryFieldDefinition \| CategoryEnvelope<CategoryFieldDefinition>` | Optional auth from local storage |
| 90 | `DELETE` | ``/api/categories/${encodeURIComponent(categoryId)}/fields/${encodeURIComponent(fieldId)}`` | `deleteCategoryField` at [src/api/categoryApi.ts:203](../src/api/categoryApi.ts#L203) | src/pages/extra/EnterpriseAdminPages.tsx :: handleFieldDelete | `none` | `unknown` | Optional auth from local storage |
| 91 | `GET` | ``${path}${query}`` | `list` at [src/api/cmsApi.ts:26](../src/api/cmsApi.ts#L26) | No static caller found | `none` | `unknown` | Optional auth from local storage |
| 92 | `GET` | `path` | `one` at [src/api/cmsApi.ts:29](../src/api/cmsApi.ts#L29) | No static caller found | `none` | `unknown` | Optional auth from local storage |
| 93 | `DELETE` | `path` | `remove` at [src/api/cmsApi.ts:32](../src/api/cmsApi.ts#L32) | No static caller found | `none` | `inferred/unknown` | Optional auth from local storage |
| 94 | `POST` | `'/api/admin/cms/banners/upload-image'` | `uploadBannerImage` at [src/api/cmsApi.ts:43](../src/api/cmsApi.ts#L43) | No static caller found | `formData` | `{ success?: boolean; url?: string; data?: { url?: string } \| string; message?: string }` | Optional auth from local storage |
| 95 | `GET` | `'/api/admin/cms/banners/counts'` | `getBannerCounts` at [src/api/cmsApi.ts:48](../src/api/cmsApi.ts#L48) | No static caller found | `none` | `unknown` | Optional auth from local storage |
| 96 | `GET` | `'/api/admin/cms/categories/counts'` | `getCategoryCounts` at [src/api/cmsApi.ts:50](../src/api/cmsApi.ts#L50) | No static caller found | `none` | `unknown` | Optional auth from local storage |
| 97 | `GET` | `'/api/admin/cms/newsletter/export'` | `exportNewsletter` at [src/api/cmsApi.ts:57](../src/api/cmsApi.ts#L57) | No static caller found | `none` | `inferred/unknown` | Optional auth from local storage |
| 98 | `GET` | `'/api/cms/testimonials'` | `getPublishedTestimonials` at [src/api/cmsApi.ts:73](../src/api/cmsApi.ts#L73) | No static caller found | `none` | `unknown` | Unauthenticated |
| 99 | `GET` | `'/api/cms/faqs'` | `getPublishedFaqs` at [src/api/cmsApi.ts:88](../src/api/cmsApi.ts#L88) | src/pages/FAQPage.tsx :: FAQPage | `none` | `unknown` | Unauthenticated |
| 100 | `GET` | ``/api/admin/contact${queryString(query)}`` | `getAdminContactMessages` at [src/api/contactAdminApi.ts:45](../src/api/contactAdminApi.ts#L45) | src/pages/admin/AdminContactMessagesPage.tsx :: loadMessages | `none` | `ContactMessagePage \| { data?: ContactMessagePage; message?: string }` | Optional auth from local storage |
| 101 | `GET` | ``/api/admin/contact/${id}`` | `getAdminContactMessage` at [src/api/contactAdminApi.ts:52](../src/api/contactAdminApi.ts#L52) | src/pages/admin/AdminContactMessagesPage.tsx :: openMessage | `none` | `ContactMessage \| { data?: ContactMessage; message?: string }` | Optional auth from local storage |
| 102 | `PATCH` | ``/api/admin/contact/${id}/status`` | `updateAdminContactMessageStatus` at [src/api/contactAdminApi.ts:59](../src/api/contactAdminApi.ts#L59) | src/pages/admin/AdminContactMessagesPage.tsx :: updateStatus | `JSON.stringify({ status })` | `ContactMessage \| { data?: ContactMessage; message?: string }` | Optional auth from local storage |
| 103 | `POST` | `'/api/contact'` | `submitContactMessage` at [src/api/contactApi.ts:11](../src/api/contactApi.ts#L11) | src/pages/ContactPage.tsx :: submit | `JSON.stringify(payload)` | `ApiResponse<unknown>` | Unauthenticated |
| 104 | `GET` | `'/api/customers/profile'` | `getCustomerProfile` at [src/api/customerApi.ts:61](../src/api/customerApi.ts#L61) | src/pages/extra/CustomerVendorExtras.tsx :: loadProfile | `none` | `ApiResponse<CustomerProfileResponse>` | Optional auth from local storage |
| 105 | `PUT` | `'/api/customer/profile'` | `saveCustomerProfile` at [src/api/customerApi.ts:71](../src/api/customerApi.ts#L71) | src/pages/extra/CustomerVendorExtras.tsx :: saveProfile | `JSON.stringify(payload)` | `ApiResponse<CustomerProfileResponse>` | Optional auth from local storage |
| 106 | `GET` | `'/api/customer/dashboard'` | `getCustomerDashboard` at [src/api/customerApi.ts:82](../src/api/customerApi.ts#L82) | src/pages/CustomerDashboardPage.tsx :: loadDashboard | `none` | `ApiResponse<CustomerDashboardResponse>` | Optional auth from local storage |
| 107 | `GET` | ``/api/customer/wallet/ledger${query}`` | `getWalletLedger` at [src/api/customerWalletApi.ts:37](../src/api/customerWalletApi.ts#L37) | src/pages/CustomerRewardsPage.tsx :: load<br>src/pages/CustomerWalletPage.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 108 | `GET` | `path` | `getObject` at [src/api/franchiseApi.ts:94](../src/api/franchiseApi.ts#L94) | No static caller found | `none` | `unknown` | Optional auth from local storage |
| 109 | `GET` | `path` | `getList` at [src/api/franchiseApi.ts:101](../src/api/franchiseApi.ts#L101) | No static caller found | `none` | `unknown` | Optional auth from local storage |
| 110 | `GET` | ``/api/home${params.toString() :: `?${params.toString()}` : ''}`` | `getHomeData` at [src/api/homeApi.ts:207](../src/api/homeApi.ts#L207) | src/pages/HomePage.tsx :: load | `none` | `ApiResponse<HomeDataResponse>` | Unauthenticated |
| 111 | `GET` | ``/api/home/deals?limit=${encodeURIComponent(limit)}`` | `getHomeDeals` at [src/api/homeApi.ts:175](../src/api/homeApi.ts#L175) | src/pages/HomePage.tsx :: loadDeals<br>src/services/productOfferService.ts :: getActiveProductOffers | `none` | `ApiResponse<HomeDealResponse[]>` | Unauthenticated |
| 112 | `GET` | ``/api/home/featured-products?limit=${limit}`` | `getFeaturedProducts` at [src/api/homeApi.ts:244](../src/api/homeApi.ts#L244) | src/pages/HomePage.tsx :: load | `none` | `ApiResponse<HomeProductListingResponse[]>`, normalized to `ProductResponse[]` | Unauthenticated |
| 113 | `GET` | ``/api/home/live-auctions?limit=${limit}`` | `getLiveAuctions` at [src/api/homeApi.ts:201](../src/api/homeApi.ts#L201) | No static caller found | `none` | `ApiResponse<AuctionResponse[]>` | Unauthenticated |
| 114 | `GET` | ``/api/home/upcoming-auctions?limit=${limit}`` | `getUpcomingAuctions` at [src/api/homeApi.ts:216](../src/api/homeApi.ts#L216) | No static caller found | `none` | `ApiResponse<AuctionResponse[]>` | Unauthenticated |
| 115 | `GET` | `'/api/home/categories'` | `getCategories` at [src/api/homeApi.ts:231](../src/api/homeApi.ts#L231) | No static caller found | `none` | `ApiResponse<CategoryResponse[]>` | Unauthenticated |
| 116 | `GET` | `'/api/home/stats'` | `getHomeStats` at [src/api/homeApi.ts:246](../src/api/homeApi.ts#L246) | No static caller found | `none` | `ApiResponse<HomeStatsResponse>` | Unauthenticated |
| 117 | `GET` | `'/api/customer/invoices'` | `getInvoices` at [src/api/invoiceApi.ts:18](../src/api/invoiceApi.ts#L18) | src/pages/extra/CustomerVendorExtras.tsx :: CustomerInvoicesPage | `none` | `ApiResponse<InvoiceResponse[]>` | Optional auth from local storage |
| 118 | `GET` | ``/api/customer/invoices/paginated?page=${page}&pageSize=${pageSize}`` | `getInvoicesPaginated` at [src/api/invoiceApi.ts:28](../src/api/invoiceApi.ts#L28) | No static caller found | `none` | `ApiResponse<{ data: InvoiceResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 119 | `GET` | ``/api/customer/invoices/${invoiceId}`` | `getInvoiceById` at [src/api/invoiceApi.ts:38](../src/api/invoiceApi.ts#L38) | No static caller found | `none` | `ApiResponse<InvoiceResponse>` | Optional auth from local storage |
| 120 | `GET` | ``/api/customer/invoices/order/${orderId}`` | `getInvoiceByOrderId` at [src/api/invoiceApi.ts:48](../src/api/invoiceApi.ts#L48) | No static caller found | `none` | `ApiResponse<InvoiceResponse>` | Optional auth from local storage |
| 121 | `GET` | ``/api/customer/invoices/${invoiceId}/download`` | `downloadInvoice` at [src/api/invoiceApi.ts:58](../src/api/invoiceApi.ts#L58) | No static caller found | `none` | `ApiResponse<{ downloadUrl: string }>` | Optional auth from local storage |
| 122 | `GET` | ``/api/customer/loyalty/balance?orderAmount=${encodeURIComponent(orderAmount)}`` | `getLoyaltyBalance` at [src/api/loyaltyApi.ts:27](../src/api/loyaltyApi.ts#L27) | src/pages/extra/BuyNowFlowPages.tsx :: BuyNowConfirmPage | `none` | `ApiResponse<{ availableLoyaltyPoints: number; pointsToCurrencyConversion: number; maximumRedeemablePoints: number; equivalentDiscountAmount: number; redemptionEnabled: boolean; }>` | Optional auth from local storage |
| 123 | `POST` | `'/api/customer/loyalty/redeem/quote'` | `getLoyaltyRedeemQuote` at [src/api/loyaltyApi.ts:42](../src/api/loyaltyApi.ts#L42) | src/pages/extra/BuyNowFlowPages.tsx :: applyLoyaltyPoints | `JSON.stringify(request)` | `ApiResponse<LoyaltyRedeemQuoteResponse>` | Optional auth from local storage |
| 124 | `GET` | ``/api/marketplace/search?${params.toString()}`` | `searchMarketplace` at [src/api/marketplaceSearchApi.ts:128](../src/api/marketplaceSearchApi.ts#L128) | src/components/Layout.tsx :: Layout<br>src/pages/MarketplacePage.tsx :: MarketplacePage<br>src/pages/extra/MarketplaceExtras.tsx :: RecommendedPage<br>src/pages/extra/MarketplaceExtras.tsx :: SearchResultsPage<br>src/pages/HomePage.tsx :: load | `none` | `ApiResponse<MarketplaceSearchPage>` | Unauthenticated |
| 125 | `POST` | `path` | `uploadMedia` at [src/api/mediaApi.ts:20](../src/api/mediaApi.ts#L20) | No static caller found | `formData` | `MediaUploadResponse` | Optional auth from local storage |
| 126 | `POST` | `'/api/customer/messages/conversations'` | `createConversation` at [src/api/messageApi.ts:27](../src/api/messageApi.ts#L27) | No static caller found | `JSON.stringify({ participantId })` | `ApiResponse<ConversationResponse>` | Optional auth from local storage |
| 127 | `GET` | `'/api/customer/messages/conversations'` | `getConversations` at [src/api/messageApi.ts:38](../src/api/messageApi.ts#L38) | src/pages/ChatPage.tsx :: ChatPage<br>src/pages/CustomerDashboardPage.tsx :: loadDashboard<br>src/pages/extra/CustomerVendorExtras.tsx :: CustomerMessagesPage | `none` | `ApiResponse<ConversationResponse[]>` | Optional auth from local storage |
| 128 | `GET` | ``/api/customer/messages/conversations/paginated?page=${page}&pageSize=${pageSize}`` | `getConversationsPaginated` at [src/api/messageApi.ts:48](../src/api/messageApi.ts#L48) | No static caller found | `none` | `ApiResponse<{ data: ConversationResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 129 | `GET` | ``/api/customer/messages/conversations/${conversationId}`` | `getConversationById` at [src/api/messageApi.ts:58](../src/api/messageApi.ts#L58) | No static caller found | `none` | `ApiResponse<ConversationResponse>` | Optional auth from local storage |
| 130 | `POST` | ``/api/customer/messages/conversations/${conversationId}`` | `sendMessage` at [src/api/messageApi.ts:68](../src/api/messageApi.ts#L68) | src/pages/extra/CustomerVendorExtras.tsx :: handleSendMessage | `JSON.stringify({ content })` | `ApiResponse<MessageResponse>` | Optional auth from local storage |
| 131 | `GET` | ``/api/customer/messages/conversations/${conversationId}/messages`` | `getMessages` at [src/api/messageApi.ts:79](../src/api/messageApi.ts#L79) | src/pages/ChatPage.tsx :: openConversation<br>src/pages/extra/CustomerVendorExtras.tsx :: selectConversation | `none` | `ApiResponse<MessageResponse[]>` | Optional auth from local storage |
| 132 | `GET` | ``/api/customer/messages/conversations/${conversationId}/messages/paginated?page=${page}&pageSize=${pageSize}`` | `getMessagesPaginated` at [src/api/messageApi.ts:89](../src/api/messageApi.ts#L89) | No static caller found | `none` | `ApiResponse<{ data: MessageResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 133 | `PUT` | ``/api/customer/messages/${messageId}/read`` | `markMessageAsRead` at [src/api/messageApi.ts:99](../src/api/messageApi.ts#L99) | No static caller found | `none` | `ApiResponse<MessageResponse>` | Optional auth from local storage |
| 134 | `GET` | `'/api/customer/messages/unread/count'` | `getUnreadMessageCount` at [src/api/messageApi.ts:109](../src/api/messageApi.ts#L109) | No static caller found | `none` | `ApiResponse<{ count: number }>` | Optional auth from local storage |
| 135 | `GET` | ``/api/${scope}/notifications`` | `getNotificationList` at [src/api/notificationApi.ts:66](../src/api/notificationApi.ts#L66) | No static caller found | `none` | `NotificationEnvelope<NotificationResponse[]>` | Optional auth from local storage |
| 136 | `GET` | ``/api/${scope}/notifications/paginated?page=${page}&pageSize=${pageSize}`` | `getNotificationPage` at [src/api/notificationApi.ts:72](../src/api/notificationApi.ts#L72) | No static caller found | `none` | `NotificationEnvelope<unknown>` | Optional auth from local storage |
| 137 | `GET` | `'/api/customer/notifications/unread'` | `getUnreadNotifications` at [src/api/notificationApi.ts:93](../src/api/notificationApi.ts#L93) | No static caller found | `none` | `ApiResponse<NotificationResponse[]>` | Optional auth from local storage |
| 138 | `GET` | `'/api/vendor/notifications/unread'` | `getVendorUnreadNotifications` at [src/api/notificationApi.ts:103](../src/api/notificationApi.ts#L103) | No static caller found | `none` | `NotificationEnvelope<NotificationResponse[]>` | Optional auth from local storage |
| 139 | `GET` | `'/api/customer/notifications/unread/count'` | `getUnreadNotificationCount` at [src/api/notificationApi.ts:109](../src/api/notificationApi.ts#L109) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `ApiResponse<number \| { count: number }>` | Optional auth from local storage |
| 140 | `GET` | `'/api/vendor/notifications/unread/count'` | `getVendorUnreadNotificationCount` at [src/api/notificationApi.ts:119](../src/api/notificationApi.ts#L119) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `NotificationEnvelope<{ count: number } \| number>` | Optional auth from local storage |
| 141 | `GET` | `'/api/admin/notifications/inbox'` | `getAdminNotificationInbox` at [src/api/notificationApi.ts:125](../src/api/notificationApi.ts#L125) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `ApiResponse<NotificationResponse[]>` | Optional auth from local storage |
| 142 | `GET` | `'/api/admin/notifications/inbox/unread/count'` | `getAdminNotificationInboxUnreadCount` at [src/api/notificationApi.ts:131](../src/api/notificationApi.ts#L131) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `ApiResponse<number>` | Optional auth from local storage |
| 143 | `PATCH` | ``/api/admin/notifications/inbox/${encodeURIComponent(String(notificationId))}/read`` | `markAdminNotificationAsRead` at [src/api/notificationApi.ts:139](../src/api/notificationApi.ts#L139) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `unknown` | Optional auth from local storage |
| 144 | `PATCH` | `'/api/admin/notifications/inbox/read-all'` | `markAllAdminNotificationsAsRead` at [src/api/notificationApi.ts:143](../src/api/notificationApi.ts#L143) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `unknown` | Optional auth from local storage |
| 145 | `GET` | ``/api/customer/notifications/${notificationId}`` | `getNotificationById` at [src/api/notificationApi.ts:147](../src/api/notificationApi.ts#L147) | No static caller found | `none` | `ApiResponse<NotificationResponse>` | Optional auth from local storage |
| 146 | `PUT` | ``/api/customer/notifications/${notificationId}/read`` | `markNotificationAsRead` at [src/api/notificationApi.ts:157](../src/api/notificationApi.ts#L157) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `ApiResponse<NotificationResponse>` | Optional auth from local storage |
| 147 | `PUT` | ``/api/vendor/notifications/${encodeURIComponent(notificationId)}/read`` | `markVendorNotificationAsRead` at [src/api/notificationApi.ts:167](../src/api/notificationApi.ts#L167) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `NotificationEnvelope<NotificationResponse>` | Optional auth from local storage |
| 148 | `PUT` | `'/api/customer/notifications/read-all'` | `markAllNotificationsAsRead` at [src/api/notificationApi.ts:172](../src/api/notificationApi.ts#L172) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `ApiResponse<void>` | Optional auth from local storage |
| 149 | `PUT` | `'/api/vendor/notifications/read-all'` | `markAllVendorNotificationsAsRead` at [src/api/notificationApi.ts:178](../src/api/notificationApi.ts#L178) | src/context/NotificationContext.tsx :: NotificationProvider | `none` | `inferred/unknown` | Optional auth from local storage |
| 150 | `POST` | `'/api/admin/notifications'` | `createAdminNotification` at [src/api/notificationApi.ts:194](../src/api/notificationApi.ts#L194) | src/pages/extra/EnterpriseAdminPages.tsx :: submit | `JSON.stringify(payload)` | `NotificationEnvelope<AdminNotificationRecord>` | Optional auth from local storage |
| 151 | `GET` | ``/api/admin/notifications?page=${page}&pageSize=${pageSize}`` | `getAdminNotificationsPaginated` at [src/api/notificationApi.ts:199](../src/api/notificationApi.ts#L199) | src/pages/extra/EnterpriseAdminPages.tsx :: loadHistory | `none` | `NotificationEnvelope<unknown>` | Optional auth from local storage |
| 152 | `GET` | ``/api/admin/notifications/${encodeURIComponent(id)}`` | `getAdminNotification` at [src/api/notificationApi.ts:204](../src/api/notificationApi.ts#L204) | No static caller found | `none` | `NotificationEnvelope<AdminNotificationRecord>` | Optional auth from local storage |
| 153 | `DELETE` | ``/api/customer/notifications/${notificationId}`` | `deleteNotification` at [src/api/notificationApi.ts:209](../src/api/notificationApi.ts#L209) | No static caller found | `none` | `ApiResponse<void>` | Optional auth from local storage |
| 154 | `GET` | `'/api/admin/offers'` | `getAdminOffers` at [src/api/offerApi.ts:194](../src/api/offerApi.ts#L194) | src/pages/OffersAdminPage.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 155 | `GET` | ``/api/admin/offers/${encodeURIComponent(id)}`` | `getAdminOffer` at [src/api/offerApi.ts:199](../src/api/offerApi.ts#L199) | src/pages/OffersAdminPage.tsx :: beginEdit | `none` | `unknown` | Optional auth from local storage |
| 156 | `GET` | ``/api/admin/offers/products${query}`` | `getAdminOfferProducts` at [src/api/offerApi.ts:207](../src/api/offerApi.ts#L207) | src/pages/OffersAdminPage.tsx :: OffersAdminPage | `none` | `unknown` | Optional auth from local storage |
| 157 | `GET` | `'/api/admin/offers/categories'` | `getAdminOfferCategories` at [src/api/offerApi.ts:212](../src/api/offerApi.ts#L212) | src/pages/OffersAdminPage.tsx :: OffersAdminPage | `none` | `unknown` | Optional auth from local storage |
| 158 | `POST` | `'/api/admin/offers'` | `createOffer` at [src/api/offerApi.ts:217](../src/api/offerApi.ts#L217) | src/pages/OffersAdminPage.tsx :: submit | `JSON.stringify(normalizeOfferRequest(request))` | `unknown` | Optional auth from local storage |
| 159 | `PUT` | ``/api/admin/offers/${encodeURIComponent(id)}`` | `updateOffer` at [src/api/offerApi.ts:222](../src/api/offerApi.ts#L222) | src/pages/OffersAdminPage.tsx :: submit<br>src/pages/OffersAdminPage.tsx :: toggle | `JSON.stringify(normalizeOfferRequest(request))` | `unknown` | Optional auth from local storage |
| 160 | `DELETE` | ``/api/admin/offers/${encodeURIComponent(id)}`` | `deleteOffer` at [src/api/offerApi.ts:227](../src/api/offerApi.ts#L227) | src/pages/OffersAdminPage.tsx :: remove | `none` | `inferred/unknown` | Optional auth from local storage |
| 161 | `GET` | `'/api/vendor/offers'` | `getVendorOffers` at [src/api/offerApi.ts:231](../src/api/offerApi.ts#L231) | src/pages/VendorOffersPage.tsx :: loadOffers | `none` | `unknown` | Optional auth from local storage |
| 162 | `GET` | ``/api/vendor/offers/${encodeURIComponent(id)}`` | `getVendorOffer` at [src/api/offerApi.ts:238](../src/api/offerApi.ts#L238) | src/pages/VendorOffersPage.tsx :: beginEdit | `none` | `unknown` | Optional auth from local storage |
| 163 | `POST` | `'/api/vendor/offers'` | `createVendorOffer` at [src/api/offerApi.ts:245](../src/api/offerApi.ts#L245) | src/pages/VendorOffersPage.tsx :: submit | `JSON.stringify(normalizeOfferRequest(request))` | `unknown` | Optional auth from local storage |
| 164 | `PUT` | ``/api/vendor/offers/${encodeURIComponent(id)}`` | `updateVendorOffer` at [src/api/offerApi.ts:252](../src/api/offerApi.ts#L252) | src/pages/VendorOffersPage.tsx :: submit | `JSON.stringify(normalizeOfferRequest(request))` | `unknown` | Optional auth from local storage |
| 165 | `DELETE` | ``/api/vendor/offers/${encodeURIComponent(id)}`` | `deleteVendorOffer` at [src/api/offerApi.ts:259](../src/api/offerApi.ts#L259) | src/pages/VendorOffersPage.tsx :: remove | `none` | `inferred/unknown` | Optional auth from local storage |
| 166 | `GET` | `'/api/customer/offers'` | `getCustomerOffers` at [src/api/offerApi.ts:263](../src/api/offerApi.ts#L263) | src/components/checkout/OfferCheckoutSection.tsx :: OfferCheckoutSection<br>src/pages/CustomerOffersPage.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 167 | `POST` | `'/api/customer/offers/validate'` | `validateOffer` at [src/api/offerApi.ts:269](../src/api/offerApi.ts#L269) | src/components/checkout/OfferCheckoutSection.tsx :: OfferCheckoutSection<br>src/components/checkout/OfferCheckoutSection.tsx :: apply | `JSON.stringify(request)` | `unknown` | Optional auth from local storage |
| 168 | `GET` | `'/api/orders/my'` | `getOrders` at [src/api/orderApi.ts:43](../src/api/orderApi.ts#L43) | src/pages/extra/CustomerVendorExtras.tsx :: loadOrders | `none` | `ApiResponse<OrderResponseDto[]>` | Optional auth from local storage |
| 169 | `GET` | ``/api/orders/${orderId}`` | `getOrderById` at [src/api/orderApi.ts:53](../src/api/orderApi.ts#L53) | src/pages/AuctionDetailPage.tsx :: restoreExistingOrder<br>src/pages/extra/BuyNowFlowPages.tsx :: fetchInvoice<br>src/pages/extra/CustomerVendorExtras.tsx :: loadOrder<br>src/pages/extra/FlowPages.tsx :: handlePaymentVerification<br>src/pages/extra/FlowPages.tsx :: loadContext<br>src/pages/extra/FlowPages.tsx :: loadInvoice<br>src/pages/extra/FlowPages.tsx :: preparePayment<br>src/pages/extra/FlowPages.tsx :: restore | `none` | `ApiResponse<OrderResponseDto>` | Optional auth from local storage |
| 170 | `PUT` | ``/api/orders/${orderId}/status`` | `cancelOrder` at [src/api/orderApi.ts:63](../src/api/orderApi.ts#L63) | src/pages/extra/BuyNowFlowPages.tsx :: handleCancelOrder | `JSON.stringify({ status: 'CANCELLED' })` | `ApiResponse<OrderResponseDto>` | Optional auth from local storage |
| 171 | `POST` | `'/api/orders'` | `createOrder` at [src/api/orderApi.ts:71](../src/api/orderApi.ts#L71) | No static caller found | `JSON.stringify(request)` | `ApiResponse<OrderResponseDto>` | Optional auth from local storage |
| 172 | `POST` | ``/api/auctions/${auctionId}/order`` | `createAuctionOrder` at [src/api/orderApi.ts:82](../src/api/orderApi.ts#L82) | src/pages/extra/FlowPages.tsx :: preparePayment | `JSON.stringify({ addressId })` | `ApiResponse<OrderResponseDto>` | Optional auth from local storage |
| 173 | `POST` | ``/api/orders/${orderId}/payments/razorpay`` | `createRazorpayPayment` at [src/api/paymentApi.ts:5](../src/api/paymentApi.ts#L5) | src/pages/extra/BuyNowFlowPages.tsx :: handlePayment<br>src/pages/extra/FlowPages.tsx :: preparePayment | `none` | `ApiResponse<RazorpayOrderResponse>` | Optional auth from local storage |
| 174 | `POST` | ``/api/orders/${orderId}/payments/razorpay/verify`` | `verifyRazorpayPayment` at [src/api/paymentApi.ts:15](../src/api/paymentApi.ts#L15) | src/pages/CustomerCartPage.tsx :: handleCheckout<br>src/pages/extra/BuyNowFlowPages.tsx :: handlePayment<br>src/pages/extra/FlowPages.tsx :: handlePaymentVerification | `JSON.stringify(request)` | `ApiResponse<PaymentResponseDto>` | Optional auth from local storage |
| 175 | `GET` | ``/api/orders/${orderId}/payments`` | `getPaymentsForOrder` at [src/api/paymentApi.ts:26](../src/api/paymentApi.ts#L26) | src/pages/AuctionDetailPage.tsx :: loadOrderPaymentState<br>src/pages/extra/FlowPages.tsx :: handlePaymentVerification<br>src/pages/extra/FlowPages.tsx :: loadInvoice<br>src/pages/extra/FlowPages.tsx :: restore | `none` | `ApiResponse<PaymentResponseDto[]>` | Optional auth from local storage |
| 176 | `GET` | ``/api/payments/${paymentId}`` | `getPaymentById` at [src/api/paymentApi.ts:36](../src/api/paymentApi.ts#L36) | No static caller found | `none` | `ApiResponse<PaymentResponseDto>` | Optional auth from local storage |
| 177 | `POST` | ``/api/products/${productId}/images`` | `createProductImage` at [src/api/productApi.ts:225](../src/api/productApi.ts#L225) | src/pages/extra/FlowPages.tsx :: handleEditNext<br>src/pages/extra/FlowPages.tsx :: handleNext | `JSON.stringify(payload)` | `ApiResponse<ProductApiImageResponse>` | Optional auth from local storage |
| 178 | `GET` | ``/api/products/${productId}/images`` | `getProductImages` at [src/api/productApi.ts:238](../src/api/productApi.ts#L238) | src/pages/extra/FlowPages.tsx :: VendorEditProductWizardPage | `none` | `ApiResponse<ProductApiImageResponse[]>` | Unauthenticated |
| 179 | `GET` | `'/api/products'` | `getProducts` at [src/api/productApi.ts:248](../src/api/productApi.ts#L248) | src/pages/ProductDetailPage.tsx :: loadProduct<br>src/pages/extra/FlowPages.tsx :: CustomerCategoryPage<br>src/pages/extra/FlowPages.tsx :: CustomerSearchPage | `none` | `ApiResponse<ProductApiResponse[]>` | Unauthenticated |
| 180 | `GET` | ``/api/products/${id}`` | `getProductById` at [src/api/productApi.ts:270](../src/api/productApi.ts#L270) | src/pages/AuctionDetailPage.tsx :: loadProductDetails<br>src/pages/MarketplacePage.tsx :: MarketplacePage<br>src/pages/ProductDetailPage.tsx :: loadProduct<br>src/pages/extra/BuyNowFlowPages.tsx :: BuyNowConfirmPage<br>src/pages/extra/CustomerVendorExtras.tsx :: loadProducts<br>src/pages/extra/FlowPages.tsx :: CustomerProductPage<br>src/pages/extra/FlowPages.tsx :: VendorEditProductWizardPage | `none` | `ApiResponse<ProductApiResponse>` | Unauthenticated |
| 181 | `POST` | ``/api/products/${productId}/buy-now`` | `createBuyNowOrder` at [src/api/productApi.ts:301](../src/api/productApi.ts#L301) | src/pages/extra/BuyNowFlowPages.tsx :: handleConfirmAndPay | `JSON.stringify(body)` | `ApiResponse<BuyNowOrderResponse>` | Optional auth from local storage |
| 182 | `GET` | `'/api/promotional-banners'` | `getPublicPromotionalBanners` at [src/api/promotionalBannerApi.ts:47](../src/api/promotionalBannerApi.ts#L47) | src/pages/HomePage.tsx :: CategoryPromotionBanner | `none` | `ApiEnvelope<PromotionalBanner[]>` | Unauthenticated |
| 183 | `GET` | `'/api/admin/promotional-banners'` | `getAdminPromotionalBanners` at [src/api/promotionalBannerApi.ts:52](../src/api/promotionalBannerApi.ts#L52) | src/pages/PromotionalBannersAdminPage.tsx :: loadBanners | `none` | `ApiEnvelope<PromotionalBanner[] \| { content?: PromotionalBanner[] }>` | Optional auth from local storage |
| 184 | `POST` | `'/api/admin/promotional-banners'` | `createPromotionalBanner` at [src/api/promotionalBannerApi.ts:57](../src/api/promotionalBannerApi.ts#L57) | src/pages/PromotionalBannersAdminPage.tsx :: handleSubmit | `JSON.stringify(input)` | `ApiEnvelope<PromotionalBanner>` | Optional auth from local storage |
| 185 | `PUT` | ``/api/admin/promotional-banners/${encodeURIComponent(id)}`` | `updatePromotionalBanner` at [src/api/promotionalBannerApi.ts:62](../src/api/promotionalBannerApi.ts#L62) | src/pages/PromotionalBannersAdminPage.tsx :: handleSubmit<br>src/pages/PromotionalBannersAdminPage.tsx :: handleToggle | `JSON.stringify(input)` | `ApiEnvelope<PromotionalBanner>` | Optional auth from local storage |
| 186 | `DELETE` | ``/api/admin/promotional-banners/${encodeURIComponent(id)}`` | `deletePromotionalBanner` at [src/api/promotionalBannerApi.ts:67](../src/api/promotionalBannerApi.ts#L67) | src/pages/PromotionalBannersAdminPage.tsx :: handleDelete | `none` | `inferred/unknown` | Optional auth from local storage |
| 187 | `POST` | `'/api/customer/reviews'` | `createReview` at [src/api/reviewApi.ts:40](../src/api/reviewApi.ts#L40) | src/pages/extra/FlowPages.tsx :: handleSubmit | `JSON.stringify(payload)` | `ApiResponse<ReviewResponse>` | Optional auth from local storage |
| 188 | `GET` | `endpoint` | `getReviewEligibility` at [src/api/reviewApi.ts:61](../src/api/reviewApi.ts#L61) | src/pages/extra/CustomerVendorExtras.tsx :: loadReviewStates<br>src/pages/extra/FlowPages.tsx :: loadContext | `none` | `ApiResponse<ReviewEligibilityResponse> \| ReviewEligibilityResponse` | Optional auth from local storage |
| 189 | `GET` | `'/api/customer/reviews'` | `getReviews` at [src/api/reviewApi.ts:79](../src/api/reviewApi.ts#L79) | src/pages/extra/CustomerVendorExtras.tsx :: loadReviews | `none` | `ApiResponse<ReviewResponse[]>` | Optional auth from local storage |
| 190 | `GET` | ``/api/customer/reviews/paginated?page=${page}&pageSize=${pageSize}`` | `getReviewsPaginated` at [src/api/reviewApi.ts:89](../src/api/reviewApi.ts#L89) | No static caller found | `none` | `ApiResponse<{ data: ReviewResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 191 | `GET` | ``/api/customer/reviews/${reviewId}`` | `getReviewById` at [src/api/reviewApi.ts:99](../src/api/reviewApi.ts#L99) | No static caller found | `none` | `ApiResponse<ReviewResponse>` | Optional auth from local storage |
| 192 | `PUT` | ``/api/customer/reviews/${reviewId}`` | `updateReview` at [src/api/reviewApi.ts:109](../src/api/reviewApi.ts#L109) | No static caller found | `JSON.stringify(payload)` | `ApiResponse<ReviewResponse>` | Optional auth from local storage |
| 193 | `DELETE` | ``/api/customer/reviews/${reviewId}`` | `deleteReview` at [src/api/reviewApi.ts:120](../src/api/reviewApi.ts#L120) | No static caller found | `none` | `ApiResponse<void>` | Optional auth from local storage |
| 194 | `GET` | ``/api/customer/reviews/product/${productId}`` | `getProductReviews` at [src/api/reviewApi.ts:126](../src/api/reviewApi.ts#L126) | src/pages/ProductDetailPage.tsx :: loadProduct<br>src/pages/extra/CustomerVendorExtras.tsx :: loadReviewStates | `none` | `ApiResponse<ReviewResponse[]>` | Unauthenticated |
| 195 | `GET` | ``/api/customer/reviews/product/${productId}/paginated?page=${page}&pageSize=${pageSize}`` | `getProductReviewsPaginated` at [src/api/reviewApi.ts:136](../src/api/reviewApi.ts#L136) | No static caller found | `none` | `ApiResponse<{ data: ReviewResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Unauthenticated |
| 196 | `GET` | `'/api/customer/rewards/summary'` | `getRewardsSummary` at [src/api/rewardsApi.ts:35](../src/api/rewardsApi.ts#L35) | src/pages/CustomerDashboardPage.tsx :: CustomerDashboardPage<br>src/pages/CustomerRewardsPage.tsx :: load<br>src/pages/extra/BuyNowFlowPages.tsx :: BuyNowConfirmPage | `none` | `RewardsRecord \| ApiEnvelope<RewardsRecord>` | Optional auth from local storage |
| 197 | `GET` | ``/api/customer/rewards/loyalty/transactions${query}`` | `getLoyaltyTransactions` at [src/api/rewardsApi.ts:43](../src/api/rewardsApi.ts#L43) | src/pages/CustomerRewardsPage.tsx :: load | `none` | `unknown` | Optional auth from local storage |
| 198 | `POST` | `'/api/customer/rewards/loyalty/redeem'` | `redeemLoyaltyPoints` at [src/api/rewardsApi.ts:55](../src/api/rewardsApi.ts#L55) | src/pages/CustomerRewardsPage.tsx :: redeem | `JSON.stringify({ points })` | `RewardsRecord \| ApiEnvelope<RewardsRecord>` | Optional auth from local storage |
| 199 | `GET` | ``/api/public/sellers?page=${encodeURIComponent(String(page))}&size=${encodeURIComponent(String(size))}`` | `getPublicSellers` at [src/api/sellerApi.ts:24](../src/api/sellerApi.ts#L24) | No static caller found | `none` | `ApiResponse<PublicSeller[] \| PublicSellerPage>` | Unauthenticated |
| 200 | `GET` | ``/api/public/sellers/${encodeURIComponent(String(vendorId))}`` | `getPublicSellerById` at [src/api/sellerApi.ts:34](../src/api/sellerApi.ts#L34) | src/pages/SellerProfilePage.tsx :: SellerProfilePage | `none` | `ApiResponse<PublicSellerProfile>` | Unauthenticated |
| 201 | `GET` | `'/api/customer/settings'` | `getSettings` at [src/api/settingsApi.ts:30](../src/api/settingsApi.ts#L30) | No static caller found | `none` | `ApiResponse<SettingsResponse>` | Optional auth from local storage |
| 202 | `PUT` | `'/api/customer/settings'` | `updateSettings` at [src/api/settingsApi.ts:40](../src/api/settingsApi.ts#L40) | No static caller found | `JSON.stringify(payload)` | `ApiResponse<SettingsResponse>` | Optional auth from local storage |
| 203 | `POST` | `'/api/customer/settings/2fa/enable'` | `enableTwoFactor` at [src/api/settingsApi.ts:51](../src/api/settingsApi.ts#L51) | No static caller found | `none` | `ApiResponse<{ secret: string; qrCode: string }>` | Optional auth from local storage |
| 204 | `POST` | `'/api/customer/settings/2fa/verify'` | `verifyTwoFactor` at [src/api/settingsApi.ts:61](../src/api/settingsApi.ts#L61) | No static caller found | `JSON.stringify({ code })` | `ApiResponse<{ enabled: boolean }>` | Optional auth from local storage |
| 205 | `POST` | `'/api/customer/settings/2fa/disable'` | `disableTwoFactor` at [src/api/settingsApi.ts:72](../src/api/settingsApi.ts#L72) | No static caller found | `none` | `ApiResponse<void>` | Optional auth from local storage |
| 206 | `POST` | `'/api/customer/support/tickets'` | `createSupportTicket` at [src/api/supportApi.ts:35](../src/api/supportApi.ts#L35) | src/pages/extra/CustomerVendorExtras.tsx :: handleCreateTicket | `JSON.stringify(payload)` | `ApiResponse<SupportTicketResponse>` | Optional auth from local storage |
| 207 | `GET` | `'/api/customer/support/tickets'` | `getSupportTickets` at [src/api/supportApi.ts:46](../src/api/supportApi.ts#L46) | src/pages/extra/CustomerVendorExtras.tsx :: CustomerSupportPage | `none` | `ApiResponse<SupportTicketResponse[]>` | Optional auth from local storage |
| 208 | `GET` | ``/api/customer/support/tickets/paginated?page=${page}&pageSize=${pageSize}`` | `getSupportTicketsPaginated` at [src/api/supportApi.ts:56](../src/api/supportApi.ts#L56) | No static caller found | `none` | `ApiResponse<{ data: SupportTicketResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 209 | `GET` | ``/api/customer/support/tickets/${ticketId}`` | `getSupportTicketById` at [src/api/supportApi.ts:66](../src/api/supportApi.ts#L66) | No static caller found | `none` | `ApiResponse<SupportTicketResponse>` | Optional auth from local storage |
| 210 | `PUT` | ``/api/customer/support/tickets/${ticketId}/status`` | `updateTicketStatus` at [src/api/supportApi.ts:76](../src/api/supportApi.ts#L76) | No static caller found | `JSON.stringify({ status })` | `ApiResponse<SupportTicketResponse>` | Optional auth from local storage |
| 211 | `PUT` | ``/api/customer/support/tickets/${ticketId}/close`` | `closeTicket` at [src/api/supportApi.ts:87](../src/api/supportApi.ts#L87) | No static caller found | `none` | `ApiResponse<SupportTicketResponse>` | Optional auth from local storage |
| 212 | `GET` | `'/api/customer/support/open-count'` | `getOpenTicketCount` at [src/api/supportApi.ts:97](../src/api/supportApi.ts#L97) | No static caller found | `none` | `ApiResponse<{ count: number }>` | Optional auth from local storage |
| 213 | `POST` | ``/api/vendors/${vendorId}/documents`` | `uploadVendorDocument` at [src/api/vendorApi.ts:153](../src/api/vendorApi.ts#L153) | src/pages/AuthPages.tsx :: uploadAadhaar<br>src/pages/AuthPages.tsx :: uploadPan<br>src/pages/AuthPages.tsx :: uploadSelfie<br>src/pages/VendorDashboardPage.tsx :: uploadDocument | `JSON.stringify(payload)` | `ApiResponse<unknown> \| null` | Optional auth from local storage |
| 214 | `GET` | ``/api/vendors/${vendorId}/documents`` | `getVendorDocuments` at [src/api/vendorApi.ts:170](../src/api/vendorApi.ts#L170) | src/components/common/Feedback.tsx :: loadKycStatus<br>src/pages/AuthPages.tsx :: KYCPage<br>src/pages/AuthPages.tsx :: submitKyc<br>src/pages/VendorDashboardPage.tsx :: loadKycDocuments | `none` | `ApiResponse<VendorDocumentRecord[]> \| VendorDocumentRecord[]` | Optional auth from local storage |
| 215 | `PUT` | ``/api/vendors/${vendorId}/documents/${documentId}`` | `approveVendorDocument` at [src/api/vendorApi.ts:186](../src/api/vendorApi.ts#L186) | src/pages/extra/EnterpriseAdminPages.tsx :: handleApproveDocument | `JSON.stringify({ status: 'APPROVED' })` | `ApiResponse<unknown> \| null` | Optional auth from local storage |
| 216 | `GET` | `'/api/vendors/me'` | `getVendorProfile` at [src/api/vendorApi.ts:197](../src/api/vendorApi.ts#L197) | src/components/common/Feedback.tsx :: loadKycStatus<br>src/pages/AuthPages.tsx :: KYCPage<br>src/pages/VendorOffersPage.tsx :: VendorOffersPage<br>src/pages/extra/CustomerVendorExtras.tsx :: load<br>src/pages/extra/FlowPages.tsx :: loadVendorAuctionOptions | `none` | `ApiResponse<VendorProfileResponse>` | Optional auth from local storage |
| 217 | `PUT` | ``/api/vendors/${currentProfile.id}`` | `updateVendorProfile` at [src/api/vendorApi.ts:220](../src/api/vendorApi.ts#L220) | src/pages/AuthPages.tsx :: submitKyc<br>src/pages/extra/CustomerVendorExtras.tsx :: saveGst | `JSON.stringify(requestPayload)` | `ApiResponse<VendorProfileResponse>` | Optional auth from local storage |
| 218 | `POST` | ``/api/vendors/${vendorId}/kyc`` | `saveVendorKyc` at [src/api/vendorApi.ts:241](../src/api/vendorApi.ts#L241) | src/pages/AuthPages.tsx :: submitKyc | `JSON.stringify(payload)` | `ApiResponse<unknown> \| null` | Optional auth from local storage |
| 219 | `GET` | `'/api/vendors/me/bank'` | `getVendorBankRecord` at [src/api/vendorApi.ts:275](../src/api/vendorApi.ts#L275) | src/pages/extra/CustomerVendorExtras.tsx :: load<br>src/pages/extra/CustomerVendorExtras.tsx :: saveBankDetails | `none` | `unknown` | Optional auth from local storage |
| 220 | `PUT` | `'/api/vendors/me/bank'` | `saveVendorBankRecord` at [src/api/vendorApi.ts:294](../src/api/vendorApi.ts#L294) | src/pages/extra/CustomerVendorExtras.tsx :: saveBankDetails | `JSON.stringify(requestBody)` | `unknown` | Optional auth from local storage |
| 221 | `GET` | `endpoint` | `getVendorAuctions` at [src/api/vendorAuctionApi.ts:23](../src/api/vendorAuctionApi.ts#L23) | src/pages/extra/CustomerVendorExtras.tsx :: VendorReportsPage<br>src/pages/extra/CustomerVendorExtras.tsx :: loadAuctions<br>src/pages/extra/FlowPages.tsx :: handlePublish | `none` | `ApiResponse<VendorAuctionApiResponse[]>` | Optional auth from local storage |
| 222 | `GET` | `'/api/vendors/me/dashboard'` | `getVendorDashboard` at [src/api/vendorDashboardApi.ts:27](../src/api/vendorDashboardApi.ts#L27) | src/pages/VendorDashboardPage.tsx :: loadDashboard | `none` | `ApiResponse<VendorDashboardResponse>` | Optional auth from local storage |
| 223 | `GET` | `'/api/vendors/me/orders'` | `getVendorOrders` at [src/api/vendorOrderApi.ts:24](../src/api/vendorOrderApi.ts#L24) | src/pages/extra/CustomerVendorExtras.tsx :: loadOrders | `none` | `ApiResponse<VendorOrderApiResponse[]>` | Optional auth from local storage |
| 224 | `GET` | `'/api/vendors/me/products'` | `getVendorProducts` at [src/api/vendorProductApi.ts:107](../src/api/vendorProductApi.ts#L107) | src/pages/AdvertisementPages.tsx :: VendorAdvertisementCreatePage<br>src/pages/VendorOffersPage.tsx :: VendorOffersPage<br>src/pages/extra/CustomerVendorExtras.tsx :: VendorInventoryPage<br>src/pages/extra/CustomerVendorExtras.tsx :: loadProducts<br>src/pages/extra/FlowPages.tsx :: VendorEditProductWizardPage<br>src/pages/extra/FlowPages.tsx :: loadVendorAuctionOptions | `none` | `ApiResponse<VendorProductApiResponse[]>` | Optional auth from local storage |
| 225 | `POST` | `'/api/products'` | `createVendorProduct` at [src/api/vendorProductApi.ts:127](../src/api/vendorProductApi.ts#L127) | src/pages/extra/FlowPages.tsx :: handleNext | `JSON.stringify(payload)` | `ApiResponse<VendorProductApiResponse>` | Optional auth from local storage |
| 226 | `PUT` | ``/api/products/${id}`` | `updateVendorProduct` at [src/api/vendorProductApi.ts:147](../src/api/vendorProductApi.ts#L147) | src/pages/extra/CustomerVendorExtras.tsx :: handleBulkAction<br>src/pages/extra/CustomerVendorExtras.tsx :: handlePublish<br>src/pages/extra/FlowPages.tsx :: handleEditNext | `JSON.stringify(payload)` | `ApiResponse<VendorProductApiResponse>` | Optional auth from local storage |
| 227 | `PUT` | ``/api/products/${productId}/inventory`` | `updateProductInventory` at [src/api/vendorProductApi.ts:167](../src/api/vendorProductApi.ts#L167) | No static caller found | `JSON.stringify({ quantity })` | `ApiResponse<VendorProductApiResponse>` | Optional auth from local storage |
| 228 | `DELETE` | ``/api/products/${id}`` | `deleteVendorProduct` at [src/api/vendorProductApi.ts:186](../src/api/vendorProductApi.ts#L186) | src/pages/extra/CustomerVendorExtras.tsx :: handleBulkAction<br>src/pages/extra/CustomerVendorExtras.tsx :: handleDelete<br>src/pages/extra/CustomerVendorExtras.tsx :: handleDeleteProduct | `none` | `ApiResponse<unknown>` | Optional auth from local storage |
| 229 | `DELETE` | ``/api/products/${productId}/images/${imageId}`` | `deleteProductImage` at [src/api/vendorProductApi.ts:202](../src/api/vendorProductApi.ts#L202) | src/pages/extra/FlowPages.tsx :: VendorEditProductWizardPage | `none` | `ApiResponse<unknown>` | Optional auth from local storage |
| 230 | `PUT` | ``/api/products/${productId}/images/${imageId}/primary`` | `setProductPrimaryImage` at [src/api/vendorProductApi.ts:207](../src/api/vendorProductApi.ts#L207) | src/pages/extra/FlowPages.tsx :: VendorEditProductWizardPage | `none` | `ApiResponse<unknown>` | Optional auth from local storage |
| 231 | `GET` | `'/api/vendors/me/revenue'` | `getVendorRevenue` at [src/api/vendorRevenueApi.ts:18](../src/api/vendorRevenueApi.ts#L18) | src/pages/extra/CustomerVendorExtras.tsx :: load | `none` | `ApiResponse<VendorRevenueResponse>` | Optional auth from local storage |
| 232 | `GET` | `'/api/vendors/me/verification-status'` | `getVendorVerificationStatus` at [src/api/vendorVerificationApi.ts:19](../src/api/vendorVerificationApi.ts#L19) | src/App.tsx :: AppRouteGuard<br>src/pages/extra/CustomerVendorExtras.tsx :: load | `none` | `ApiResponse<VendorVerificationResponse>` | Optional auth from local storage |
| 233 | `POST` | `'/api/search/visual'` | `visualProductSearch` at [src/api/visualSearchApi.ts:41](../src/api/visualSearchApi.ts#L41) | src/components/Layout.tsx :: submitVisualSearch | `formData` | `VisualProductSearchResponse` | Optional auth from local storage |
| 234 | `POST` | `'/api/search/voice'` | `voiceProductSearch` at [src/api/voiceSearchApi.ts:30](../src/api/voiceSearchApi.ts#L30) | src/components/VoiceSearchModal.tsx :: submitSearch | `formData` | `VoiceProductSearchResponse` | Optional auth from local storage |
| 235 | `GET` | `'/api/customer/wallet'` | `getWallet` at [src/api/walletApi.ts:29](../src/api/walletApi.ts#L29) | src/pages/WalletPage.tsx :: loadWallet | `none` | `ApiResponse<WalletResponse>` | Optional auth from local storage |
| 236 | `GET` | `'/api/customer/wallet/balance'` | `getWalletBalance` at [src/api/walletApi.ts:39](../src/api/walletApi.ts#L39) | No static caller found | `none` | `ApiResponse<{ balance: number }>` | Optional auth from local storage |
| 237 | `GET` | `'/api/customer/wallet/transactions'` | `getTransactions` at [src/api/walletApi.ts:49](../src/api/walletApi.ts#L49) | src/pages/WalletPage.tsx :: loadWallet<br>src/pages/extra/CustomerVendorExtras.tsx :: CustomerTransactionsPage | `none` | `ApiResponse<TransactionResponse[]>` | Optional auth from local storage |
| 238 | `GET` | ``/api/customer/wallet/transactions/paginated?page=${page}&pageSize=${pageSize}`` | `getTransactionsPaginated` at [src/api/walletApi.ts:59](../src/api/walletApi.ts#L59) | No static caller found | `none` | `ApiResponse<{ data: TransactionResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 239 | `POST` | `'/api/customer/wallet/add-money'` | `addMoney` at [src/api/walletApi.ts:69](../src/api/walletApi.ts#L69) | No static caller found | `JSON.stringify({ amount })` | `ApiResponse<{ orderId: string; amount: number; currency: string }>` | Optional auth from local storage |
| 240 | `GET` | `'/api/customer/wishlist'` | `getWishlist` at [src/api/wishlistApi.ts:59](../src/api/wishlistApi.ts#L59) | src/context/WishlistContext.tsx :: WishlistProvider | `none` | `ApiResponse<WishlistItemResponse[]>` | Optional auth from local storage |
| 241 | `GET` | ``/api/customer/wishlist/paginated?page=${encodeURIComponent(page)}&size=${encodeURIComponent(pageSize)}`` | `getWishlistPaginated` at [src/api/wishlistApi.ts:69](../src/api/wishlistApi.ts#L69) | No static caller found | `none` | `ApiResponse<{ data: WishlistItemResponse[]; meta: { page: number; pageSize: number; total: number } }>` | Optional auth from local storage |
| 242 | `GET` | `'/api/customer/wishlist/count'` | `getWishlistCount` at [src/api/wishlistApi.ts:79](../src/api/wishlistApi.ts#L79) | src/context/WishlistContext.tsx :: WishlistProvider | `none` | `ApiResponse<number>` | Optional auth from local storage |
| 243 | `POST` | `'/api/customer/wishlist'` | `addToWishlist` at [src/api/wishlistApi.ts:89](../src/api/wishlistApi.ts#L89) | No static caller found | `JSON.stringify({ productId })` | `ApiResponse<WishlistItemResponse>` | Optional auth from local storage |
| 244 | `POST` | ``/api/customer/wishlist/toggle?${query.toString()}`` | `toggleWishlist` at [src/api/wishlistApi.ts:104](../src/api/wishlistApi.ts#L104) | src/context/WishlistContext.tsx :: WishlistProvider | `none` | `ApiResponse<WishlistItemResponse>` | Optional auth from local storage |
| 245 | `DELETE` | ``/api/customer/wishlist/${wishlistId}`` | `removeFromWishlist` at [src/api/wishlistApi.ts:114](../src/api/wishlistApi.ts#L114) | src/context/WishlistContext.tsx :: WishlistProvider | `none` | `ApiResponse<void>` | Optional auth from local storage |
| 246 | `GET` | `'/api/vendors/me/withdrawals/balance'` | `getVendorWithdrawalBalance` at [src/api/withdrawalApi.ts:65](../src/api/withdrawalApi.ts#L65) | src/pages/extra/CustomerVendorExtras.tsx :: load | `none` | `WithdrawalBalance \| number \| string \| ApiResponse<WithdrawalBalance \| number \| string>` | Optional auth from local storage |
| 247 | `GET` | `'/api/vendors/me/withdrawals'` | `getVendorWithdrawals` at [src/api/withdrawalApi.ts:79](../src/api/withdrawalApi.ts#L79) | src/pages/extra/CustomerVendorExtras.tsx :: load | `none` | `WithdrawalRecord[] \| ApiResponse<WithdrawalRecord[]>` | Optional auth from local storage |
| 248 | `POST` | `'/api/vendors/me/withdrawals'` | `createVendorWithdrawal` at [src/api/withdrawalApi.ts:85](../src/api/withdrawalApi.ts#L85) | src/pages/extra/CustomerVendorExtras.tsx :: submitWithdrawal | `JSON.stringify({ amount })` | `WithdrawalRecord \| ApiResponse<WithdrawalRecord>` | Optional auth from local storage |
| 249 | `GET` | `'/api/admin/withdrawals/pending'` | `getPendingWithdrawals` at [src/api/withdrawalApi.ts:93](../src/api/withdrawalApi.ts#L93) | No static caller found | `none` | `WithdrawalRecord[] \| ApiResponse<WithdrawalRecord[]>` | Optional auth from local storage |
| 250 | `PUT` | ``/api/admin/withdrawals/${id}/approve`` | `approveWithdrawal` at [src/api/withdrawalApi.ts:99](../src/api/withdrawalApi.ts#L99) | No static caller found | `none` | `WithdrawalRecord \| ApiResponse<WithdrawalRecord>` | Optional auth from local storage |
| 251 | `PUT` | ``/api/admin/withdrawals/${id}/reject`` | `rejectWithdrawal` at [src/api/withdrawalApi.ts:104](../src/api/withdrawalApi.ts#L104) | No static caller found | `none` | `WithdrawalRecord \| ApiResponse<WithdrawalRecord>` | Optional auth from local storage |
| 252 | `GET` | `'/api/admin/settings/getgeneral'` | `Footer` at [src/components/Footer.tsx:23](../src/components/Footer.tsx#L23) | No static caller found | `none` | `GeneralSettings \| GeneralSettingsResponse` | Unauthenticated |
| 253 | `GET` | ``/api/vendor/orders?page=${page}&size=${size}`` | `getVendorOrders` at [src/api/vendorOrderApi.ts:48](../src/api/vendorOrderApi.ts#L48) | src/pages/extra/CustomerVendorExtras.tsx :: loadOrders | `none` | `VendorOrdersPageResult` | Authenticated client |
| 254 | `GET` | ``/api/vendor/orders/${encodeURIComponent(String(orderId))}`` | `getVendorOrder` at [src/api/vendorOrderApi.ts:64](../src/api/vendorOrderApi.ts#L64) | src/pages/extra/CustomerVendorExtras.tsx :: loadOrderDetail | `none` | `VendorOrderApiResponse` | Authenticated client |
| 255 | `PUT` | ``/api/vendor/orders/${encodeURIComponent(String(orderId))}/scheduled-delivery-date`` | `updateScheduledDeliveryDate` at [src/api/vendorOrderApi.ts:69](../src/api/vendorOrderApi.ts#L69) | src/pages/extra/CustomerVendorExtras.tsx :: scheduleSelectedOrder | `JSON.stringify({ scheduledDeliveryDate })` | `void` | Authenticated client |
| 256 | `POST` | `'/api/vendor/delivery-shares'` | `createDeliveryShare` at [src/api/deliveryShareApi.ts:53](../src/api/deliveryShareApi.ts#L53) | src/pages/extra/CustomerVendorExtras.tsx :: createShare | `JSON.stringify(request)` | `DeliveryShareResponse` | Authenticated client |
| 257 | `POST` | ``/api/vendor/delivery-shares/${encodeURIComponent(String(shareId))}/revoke`` | `revokeDeliveryShare` at [src/api/deliveryShareApi.ts:65](../src/api/deliveryShareApi.ts#L65) | src/pages/extra/CustomerVendorExtras.tsx :: revokeShare | `none` | `void` | Authenticated client |
| 258 | `GET` | ``/api/public/delivery-shares/${encodeURIComponent(token)}`` | `getPublicDeliveryShare` at [src/api/deliveryShareApi.ts:72](../src/api/deliveryShareApi.ts#L72) | src/pages/DeliverySharePage.tsx :: DeliverySharePage | `none` | `PublicDeliveryShareResponse` | Unauthenticated |


### Resolved endpoint path arguments passed through service builders

These source literals are supplied to service helper functions rather than appearing directly in the low-level transport call. The method is shown when it can be followed to the helper's transport call; otherwise it is marked helper-defined. This supplements the call-site table for generic builders and is not backend contract verification.

| Helper method | Endpoint path literal | Calling API function ? helper | Source |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | `getAdminDashboard` ? `detail` | [src/api/adminApi.ts:111](../src/api/adminApi.ts#L111) |
| `GET` | `/api/admin/users` | `getAdminUsers` ? `list` | [src/api/adminApi.ts:113](../src/api/adminApi.ts#L113) |
| `GET` | `/api/admin/users/paginated` | `getAdminUsersPaginated` ? `paginated` | [src/api/adminApi.ts:114](../src/api/adminApi.ts#L114) |
| `GET` | `/api/admin/users/search` | `searchAdminUsers` ? `list` | [src/api/adminApi.ts:116](../src/api/adminApi.ts#L116) |
| `GET` | `/api/admin/customers` | `getAdminCustomers` ? `list` | [src/api/adminApi.ts:119](../src/api/adminApi.ts#L119) |
| `GET` | `/api/admin/vendors` | `getAdminVendors` ? `list` | [src/api/adminApi.ts:139](../src/api/adminApi.ts#L139) |
| `GET` | `/api/admin/franchises` | `getAdminFranchises` ? `list` | [src/api/adminApi.ts:140](../src/api/adminApi.ts#L140) |
| `GET` | `/api/admin/franchises/available-admins` | `getAvailableFranchiseAdmins` ? `list` | [src/api/adminApi.ts:141](../src/api/adminApi.ts#L141) |
| `GET` | `/api/admin/vendors/paginated` | `getAdminVendorsPaginated` ? `paginated` | [src/api/adminApi.ts:145](../src/api/adminApi.ts#L145) |
| `GET` | `/api/admin/auctions` | `getAdminAuctions` ? `list` | [src/api/adminApi.ts:153](../src/api/adminApi.ts#L153) |
| `GET` | `/api/admin/auctions/paginated` | `getAdminAuctionsPaginated` ? `paginated` | [src/api/adminApi.ts:154](../src/api/adminApi.ts#L154) |
| `GET` | `/api/admin/auctions/search` | `searchAdminAuctions` ? `list` | [src/api/adminApi.ts:156](../src/api/adminApi.ts#L156) |
| `GET` | `/api/admin/orders` | `getAdminOrders` ? `list` | [src/api/adminApi.ts:161](../src/api/adminApi.ts#L161) |
| `GET` | `/api/admin/orders/paginated` | `getAdminOrdersPaginated` ? `paginated` | [src/api/adminApi.ts:162](../src/api/adminApi.ts#L162) |
| `GET` | `/api/admin/orders/search` | `searchAdminOrders` ? `list` | [src/api/adminApi.ts:164](../src/api/adminApi.ts#L164) |
| `GET` | `/api/admin/orders/date-range` | `getAdminOrdersByDateRange` ? `list` | [src/api/adminApi.ts:166](../src/api/adminApi.ts#L166) |
| `GET` | `/api/admin/products` | `getAdminProducts` ? `list` | [src/api/adminApi.ts:169](../src/api/adminApi.ts#L169) |
| `GET` | `/api/admin/products/paginated` | `getAdminProductsPaginated` ? `paginated` | [src/api/adminApi.ts:170](../src/api/adminApi.ts#L170) |
| `GET` | `/api/admin/products/search` | `searchAdminProducts` ? `list` | [src/api/adminApi.ts:172](../src/api/adminApi.ts#L172) |
| `GET` | `/api/admin/payments` | `getAdminPayments` ? `list` | [src/api/adminApi.ts:177](../src/api/adminApi.ts#L177) |
| `GET` | `/api/admin/payments/paginated` | `getAdminPaymentsPaginated` ? `paginated` | [src/api/adminApi.ts:178](../src/api/adminApi.ts#L178) |
| `GET` | `/api/admin/payments/search` | `searchAdminPayments` ? `list` | [src/api/adminApi.ts:180](../src/api/adminApi.ts#L180) |
| `GET` | `/api/admin/payments/date-range` | `getAdminPaymentsByDateRange` ? `list` | [src/api/adminApi.ts:182](../src/api/adminApi.ts#L182) |
| `GET` | `/api/admin/reports/orders` | `getAdminOrdersReport` ? `detail` | [src/api/adminApi.ts:185](../src/api/adminApi.ts#L185) |
| `GET` | `/api/admin/reports/auctions` | `getAdminAuctionsReport` ? `detail` | [src/api/adminApi.ts:186](../src/api/adminApi.ts#L186) |
| `GET` | `/api/admin/reports/users` | `getAdminUsersReport` ? `detail` | [src/api/adminApi.ts:187](../src/api/adminApi.ts#L187) |
| `GET` | `/api/admin/reports/payments` | `getAdminPaymentsReport` ? `detail` | [src/api/adminApi.ts:188](../src/api/adminApi.ts#L188) |
| `GET` | `/api/admin/settings/getgeneral` | `getAdminGeneralSettings` ? `getSetting` | [src/api/adminSettingsApi.ts:77](../src/api/adminSettingsApi.ts#L77) |
| `PUT` | `/api/admin/settings/general` | `updateAdminGeneralSettings` ? `updateSetting` | [src/api/adminSettingsApi.ts:78](../src/api/adminSettingsApi.ts#L78) |
| `GET` | `/api/admin/settings/getauction-rules` | `getAdminAuctionRules` ? `getSetting` | [src/api/adminSettingsApi.ts:80](../src/api/adminSettingsApi.ts#L80) |
| `PUT` | `/api/admin/settings/auction-rules` | `updateAdminAuctionRules` ? `updateSetting` | [src/api/adminSettingsApi.ts:81](../src/api/adminSettingsApi.ts#L81) |
| `GET` | `/api/admin/settings/getregistration-fee` | `getAdminRegistrationFeeSettings` ? `getSetting` | [src/api/adminSettingsApi.ts:83](../src/api/adminSettingsApi.ts#L83) |
| `PUT` | `/api/admin/settings/registration-fee` | `updateAdminRegistrationFeeSettings` ? `updateSetting` | [src/api/adminSettingsApi.ts:84](../src/api/adminSettingsApi.ts#L84) |
| `GET` | `/api/admin/settings/getcommission-rules` | `getAdminCommissionRules` ? `getSetting` | [src/api/adminSettingsApi.ts:86](../src/api/adminSettingsApi.ts#L86) |
| `PUT` | `/api/admin/settings/commission-rules` | `updateAdminCommissionRules` ? `updateSetting` | [src/api/adminSettingsApi.ts:87](../src/api/adminSettingsApi.ts#L87) |
| `GET` | `/api/admin/settings/getplatform-charges` | `getAdminPlatformCharges` ? `getSetting` | [src/api/adminSettingsApi.ts:89](../src/api/adminSettingsApi.ts#L89) |
| `PUT` | `/api/admin/settings/platform-charges` | `updateAdminPlatformCharges` ? `updateSetting` | [src/api/adminSettingsApi.ts:90](../src/api/adminSettingsApi.ts#L90) |
| `GET` | `/api/admin/settings/getshipping-rules` | `getAdminShippingRules` ? `getSetting` | [src/api/adminSettingsApi.ts:92](../src/api/adminSettingsApi.ts#L92) |
| `PUT` | `/api/admin/settings/shipping-rules` | `updateAdminShippingRules` ? `updateSetting` | [src/api/adminSettingsApi.ts:93](../src/api/adminSettingsApi.ts#L93) |
| `GET` | `/api/admin/settings/gettax` | `getAdminTaxSettings` ? `getSetting` | [src/api/adminSettingsApi.ts:95](../src/api/adminSettingsApi.ts#L95) |
| `PUT` | `/api/admin/settings/tax` | `updateAdminTaxSettings` ? `updateSetting` | [src/api/adminSettingsApi.ts:96](../src/api/adminSettingsApi.ts#L96) |
| `GET` | `/api/admin/settings/getemail` | `getAdminEmailSettings` ? `getSetting` | [src/api/adminSettingsApi.ts:99](../src/api/adminSettingsApi.ts#L99) |
| `PUT` | `/api/admin/settings/email` | `updateAdminEmailSettings` ? `updateSetting` | [src/api/adminSettingsApi.ts:110](../src/api/adminSettingsApi.ts#L110) |
| `GET` | `/api/admin/settings/getsms` | `getAdminSmsSettings` ? `getSetting` | [src/api/adminSettingsApi.ts:121](../src/api/adminSettingsApi.ts#L121) |
| `PUT` | `/api/admin/settings/sms` | `updateAdminSmsSettings` ? `updateSetting` | [src/api/adminSettingsApi.ts:131](../src/api/adminSettingsApi.ts#L131) |
| `GET` | `/api/admin/settings/getsecurity` | `getAdminSecuritySettings` ? `getSetting` | [src/api/adminSettingsApi.ts:140](../src/api/adminSettingsApi.ts#L140) |
| `PUT` | `/api/admin/settings/security` | `updateAdminSecuritySettings` ? `updateSetting` | [src/api/adminSettingsApi.ts:141](../src/api/adminSettingsApi.ts#L141) |
| `GET` | `/api/admin/settings/getlocalization` | `getAdminLocalizationSettings` ? `getSetting` | [src/api/adminSettingsApi.ts:160](../src/api/adminSettingsApi.ts#L160) |
| `PUT` | `/api/admin/settings/localization` | `updateAdminLocalizationSettings` ? `updateSetting` | [src/api/adminSettingsApi.ts:161](../src/api/adminSettingsApi.ts#L161) |
| `GET` | `/api/advertisements/home-banners` | `getHomeBannerAdvertisements` ? `getPublicAdvertisements` | [src/api/advertisementApi.ts:42](../src/api/advertisementApi.ts#L42) |
| `POST` | `/auth/verify-registration-otp` | `verifyRegistrationOtp` ? `postAuthAction` | [src/api/authApi.ts:266](../src/api/authApi.ts#L266) |
| `POST` | `/auth/resend-registration-otp` | `resendRegistrationOtp` ? `postAuthAction` | [src/api/authApi.ts:270](../src/api/authApi.ts#L270) |
| `POST` | `/auth/forgot-password` | `forgotPassword` ? `postAuthAction` | [src/api/authApi.ts:274](../src/api/authApi.ts#L274) |
| `POST` | `/auth/verify-reset-otp` | `verifyResetOtp` ? `postAuthAction` | [src/api/authApi.ts:283](../src/api/authApi.ts#L283) |
| `POST` | `/auth/reset-password` | `resetPassword` ? `postAuthAction` | [src/api/authApi.ts:298](../src/api/authApi.ts#L298) |
| `helper-defined` | `/api/admin/cms/banners` | `getBanners` ? `resource` | [src/api/cmsApi.ts:39](../src/api/cmsApi.ts#L39) |
| `helper-defined` | `/api/admin/cms/banners` | `getBanner` ? `resource` | [src/api/cmsApi.ts:39](../src/api/cmsApi.ts#L39) |
| `helper-defined` | `/api/admin/cms/banners` | `createBanner` ? `resource` | [src/api/cmsApi.ts:39](../src/api/cmsApi.ts#L39) |
| `helper-defined` | `/api/admin/cms/banners` | `updateBanner` ? `resource` | [src/api/cmsApi.ts:39](../src/api/cmsApi.ts#L39) |
| `helper-defined` | `/api/admin/cms/banners` | `deleteBanner` ? `resource` | [src/api/cmsApi.ts:39](../src/api/cmsApi.ts#L39) |
| `helper-defined` | `/api/admin/cms/banners` | `updateBannerStatus` ? `resource` | [src/api/cmsApi.ts:39](../src/api/cmsApi.ts#L39) |
| `helper-defined` | `/api/admin/cms/categories` | `getCategories` ? `resource` | [src/api/cmsApi.ts:49](../src/api/cmsApi.ts#L49) |
| `helper-defined` | `/api/admin/cms/categories` | `getCategory` ? `resource` | [src/api/cmsApi.ts:49](../src/api/cmsApi.ts#L49) |
| `helper-defined` | `/api/admin/cms/categories` | `createCategory` ? `resource` | [src/api/cmsApi.ts:49](../src/api/cmsApi.ts#L49) |
| `helper-defined` | `/api/admin/cms/categories` | `updateCategory` ? `resource` | [src/api/cmsApi.ts:49](../src/api/cmsApi.ts#L49) |
| `helper-defined` | `/api/admin/cms/categories` | `deleteCategory` ? `resource` | [src/api/cmsApi.ts:49](../src/api/cmsApi.ts#L49) |
| `helper-defined` | `/api/admin/cms/categories` | `updateCategoryStatus` ? `resource` | [src/api/cmsApi.ts:49](../src/api/cmsApi.ts#L49) |
| `helper-defined` | `/api/admin/cms/faq` | `cmsApi` ? `resource` | [src/api/cmsApi.ts:52](../src/api/cmsApi.ts#L52) |
| `helper-defined` | `/api/admin/cms/blog` | `cmsApi` ? `resource` | [src/api/cmsApi.ts:53](../src/api/cmsApi.ts#L53) |
| `helper-defined` | `/api/admin/cms/testimonials` | `cmsApi` ? `resource` | [src/api/cmsApi.ts:54](../src/api/cmsApi.ts#L54) |
| `helper-defined` | `/api/admin/cms/pages` | `cmsApi` ? `resource` | [src/api/cmsApi.ts:55](../src/api/cmsApi.ts#L55) |
| `helper-defined` | `/api/admin/cms/newsletter` | `cmsApi` ? `resource` | [src/api/cmsApi.ts:56](../src/api/cmsApi.ts#L56) |
| `GET` | `/api/franchise/me` | `getFranchiseMe` ? `getObject` | [src/api/franchiseApi.ts:109](../src/api/franchiseApi.ts#L109) |
| `GET` | `/api/franchise/dashboard` | `getFranchiseDashboard` ? `getObject` | [src/api/franchiseApi.ts:117](../src/api/franchiseApi.ts#L117) |
| `GET` | `/api/franchise/vendors` | `getFranchiseVendors` ? `getList` | [src/api/franchiseApi.ts:118](../src/api/franchiseApi.ts#L118) |
| `GET` | `/api/franchise/products` | `getFranchiseProducts` ? `getList` | [src/api/franchiseApi.ts:120](../src/api/franchiseApi.ts#L120) |
| `GET` | `/api/franchise/orders` | `getFranchiseOrders` ? `getList` | [src/api/franchiseApi.ts:122](../src/api/franchiseApi.ts#L122) |
| `GET` | `/api/franchise/analytics` | `getFranchiseAnalytics` ? `getObject` | [src/api/franchiseApi.ts:124](../src/api/franchiseApi.ts#L124) |
| `GET` | `/api/franchise/customers` | `getFranchiseCustomers` ? `getList` | [src/api/franchiseApi.ts:125](../src/api/franchiseApi.ts#L125) |
| `POST` | `/api/media/camera` | `uploadCameraMedia` ? `uploadMedia` | [src/api/mediaApi.ts:34](../src/api/mediaApi.ts#L34) |
| `POST` | `/api/media/voice` | `uploadVoiceMedia` ? `uploadMedia` | [src/api/mediaApi.ts:38](../src/api/mediaApi.ts#L38) |
