import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth, type UserType } from './context/AuthContext';
import { UserProvider, CartProvider, WalletProvider, NotificationProvider, ThemeProvider, LocaleProvider } from './context';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { BlogPage } from './pages/BlogPage';
import { CareersPage } from './pages/CareersPage';
import { PolicyPage } from './pages/PolicyPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellerProfilePage } from './pages/SellerProfilePage';
import { WishlistPage } from './pages/WishlistPage';
import { AuctionsPage } from './pages/AuctionsPage';
import { AuctionDetailPage } from './pages/AuctionDetailPage';
import { LoginPage, RegisterPage, CustomerRegisterPage, VendorRegisterPage, OTPPage, ForgotPasswordPage, ResetPasswordPage, KYCPage, RegistrationFeePage } from './pages/AuthPages';
import OnboardingWizard from './pages/OnboardingWizard';
import { CustomerWelcome, VendorWelcome } from './pages/WelcomePages';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { WalletPage } from './pages/WalletPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage, MaintenancePage, ComingSoonPage, NewsletterPage, PressPage } from './pages/extra/ExtraPages';
import { CategoriesPage, SubCategoriesPage, SearchResultsPage, RecommendedPage } from './pages/extra/MarketplaceExtras';
import { LiveAuctionsPage, UpcomingAuctionsPage, EndedAuctionsPage, WinnerScreenPage } from './pages/extra/AuctionExtras';
import {
  CustomerSearchPage,
  CustomerFilterPage,
  CustomerCategoryPage,
  CustomerProductPage,
  CustomerSellerPage,
  CustomerWishlistPage,
  CustomerWatchAuctionPage,
  CustomerPlaceBidPage,
  CustomerBidConfirmationPage,
  CustomerWalletPaymentPage,
  CustomerAuctionLivePage,
  CustomerWinnerPage,
  CustomerCheckoutPage,
  CustomerAddressPage,
  CustomerShippingPage,
  CustomerPaymentPage,
  CustomerOrderSuccessPage,
  CustomerInvoicePage,
  CustomerTrackOrderPage,
  CustomerDeliveredPage,
  CustomerReviewPage,
  VendorCreateProductWizardPage,
  VendorEditProductWizardPage,
  VendorCreateAuctionWizardPage,
} from './pages/extra/FlowPages';
import { SupportTicketsPage, InvoicesPage, DownloadsPage } from './pages/extra/DashboardExtras';
import { CommissionSettingsPage, RefundsPage, RolesPage } from './pages/extra/AdminExtras';
import { AddMoneyPage, WithdrawPage } from './pages/extra/WalletExtras';
import { AdminChatPage, SupportChatPage } from './pages/extra/ChatExtras';
import { OrganizationHierarchyPage, FranchiseManagementPage, LocationManagementPage, RolePermissionPage, FranchiseDashboardPage } from './pages/extra/OrganizationExtras';
import { SuperAdminDashboardPage, FranchiseDashboardAdminPage, RolePermissionMatrixPage, ApprovalCenterPage, SystemSettingsPage, CMSPage, ReportsPage, AdminLoginPage, FranchiseManagementAdminPage, VendorManagementAdminPage, OrdersManagementAdminPage, DeliveryManagementAdminPage, WalletManagementAdminPage, AuctionManagementAdminPage, ContentManagementAdminPage, CMSBannersPage, CMSCategoriesPage, CMSFaqPage, CMSBlogPage, CMSTestimonialsPage, CMSNewsletterPage, CMSPagesPage, SettingsGeneralPage, SettingsAuctionRulesPage, SettingsRegistrationFeePage, SettingsCommissionRulesPage, SettingsPlatformChargesPage, SettingsShippingRulesPage, SettingsTaxPage, SettingsEmailPage, SettingsSmsPage, SettingsNotificationTemplatesPage, SettingsSecurityPage, SettingsLocalizationPage, ApprovalVendorsPage, ApprovalFranchisesPage, ApprovalProductsPage, ApprovalAuctionsPage, ApprovalKycPage, PermissionsRolesPage, PermissionsRoleCreatePage, PermissionsRoleDetailPage, PermissionsMatrixPage, ReportsSalesPage, ReportsRevenuePage, ReportsAuctionsPage, ReportsVendorsPage, ReportsCustomersPage, ReportsOrdersPage, ReportsDeliveryPage, ReportsWalletPage, ReportsCommissionPage, ReportsFranchisePage, FranchiseDetailPage as AdminFranchiseDetailPage, FranchiseCreatePage as AdminFranchiseCreatePage, FranchiseEditPage as AdminFranchiseEditPage, FranchiseVendorsPage as AdminFranchiseVendorsPage, FranchiseOrdersPage as AdminFranchiseOrdersPage, FranchisePerformancePage as AdminFranchisePerformancePage, VendorDetailPage as AdminVendorDetailPage, VendorEditPage as AdminVendorEditPage, VendorProductsPage as AdminVendorProductsPage, VendorAuctionsPage as AdminVendorAuctionsPage, VendorOrdersPage as AdminVendorOrdersPage, VendorWalletPage as AdminVendorWalletPage, VendorKycPage as AdminVendorKycPage, VendorPerformancePage as AdminVendorPerformancePage, AdminOrderDetailPage, DeliveryPartnersPage, DeliveryPartnerDetailPage, DeliveryAssignmentsPage, DeliveryPerformancePage, WalletTransactionsPage, WalletWithdrawalsPage, WalletRefundsPage, WalletSettlementsPage, WalletCommissionsPage, WalletTransactionDetailPage, AuctionLivePage, AuctionUpcomingPage, AuctionCompletedPage, AuctionPendingPage, AuctionDetailAdminPage, AuctionBidHistoryPage, ContentCategoriesPage, ContentBannersPage, ContentAnnouncementsPage, ContentNotificationsPage, ContentFaqPage, ContentHelpPage } from './pages/extra/EnterpriseAdminPages';
import { CustomerProfilePage, CustomerOrdersPage, CustomerAuctionsPage, CustomerBidsPage, CustomerWonAuctionsPage, CustomerRecentlyViewedPage, CustomerWatchlistPage, CustomerSavedSearchesPage, CustomerTransactionsPage, CustomerAddressesPage, CustomerMessagesPage, CustomerReviewsPage, CustomerSupportPage, CustomerInvoicesPage, CustomerSettingsPage, CustomerOrderDetailPage, CustomerAuctionDetailPage, VendorBusinessInfoPage, VendorGstPage, VendorBankPage, VendorIdentityPage, VendorStoreVerificationPage, VendorStoreProfilePage, VendorStoreSettingsPage, VendorSubscriptionPage, VendorWalletPage, VendorWithdrawPage, VendorSalesAnalyticsPage, VendorOrdersPage, VendorCustomersPage, VendorInventoryPage, VendorProductsPage, VendorProductVariantsPage, VendorCreateProductPage, VendorEditProductPage, VendorDeleteProductPage, VendorCreateAuctionPage, VendorEditAuctionPage, VendorAuctionAnalyticsPage, VendorMessagesPage, VendorNotificationsPage, VendorReviewsPage, VendorSupportTicketsPage, VendorReportsPage } from './pages/extra/CustomerVendorExtras';
import { BuyNowConfirmPage, BuyNowPaymentPage, BuyNowOrderSuccessPage, BuyNowInvoicePage } from './pages/extra/BuyNowFlowPages';
import { AdminDashboardApiPage, AdminReportApiPage, AdminResourceDetailPage, AdminResourcePage } from './pages/admin/AdminApiPages';

function AppRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, authReady } = useAuth();
  const pathname = location.pathname;
  const isCustomerRoute = pathname === '/dashboards/customer' || pathname.startsWith('/customer');
  const isVendorRoute = pathname === '/dashboards/vendor' || pathname.startsWith('/vendor');
  const isAdminRoute = pathname === '/dashboards/admin' || pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';

  if (!authReady) {
    return null;
  }

  if (isAdminRoute && !isAdminLoginRoute) {
    if (!user) {
      return <Navigate to="/admin/login" replace />;
    }
    if (!['ADMIN', 'SUPER_ADMIN', 'FRANCHISE_ADMIN'].includes(user.role || '')) {
      return <Navigate to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} replace />;
    }
  }
  const isAuthEntryRoute = ['/login', '/register', '/register/customer', '/register/vendor', '/onboarding'].includes(pathname);

  if (isAuthEntryRoute && user) {
    return <Navigate to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} replace />;
  }

  if (isCustomerRoute) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.type !== 'customer') {
      return <Navigate to={user.type === 'vendor' ? '/dashboards/vendor' : '/login'} replace />;
    }
  }

  if (isVendorRoute) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.type !== 'vendor') {
      return <Navigate to={user.type === 'customer' ? '/dashboards/customer' : '/login'} replace />;
    }
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
    <UserProvider>
      <CartProvider>
        <WalletProvider>
          <NotificationProvider>
            <LocaleProvider>
              <ThemeProvider>
                <Layout>
                <AnimatePresence mode="wait">
                  <AppRouteGuard>
                  <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/privacy" element={<PolicyPage title="Privacy Policy" subtitle="How we protect your information" body="Bidzo handles personal data with strict privacy controls, secure storage, and transparent usage guidelines for all users and partners." />} />
            <Route path="/terms" element={<PolicyPage title="Terms" subtitle="Platform rules and responsibilities" body="All platform participants agree to lawful conduct, accurate listing practices, and respect for the marketplace community and trust standards." />} />
            <Route path="/refund" element={<PolicyPage title="Refund Policy" subtitle="How purchase disputes are handled" body="Refunds may be issued for cancellations, delivery issues, or platform-mediated disputes by case review and verification." />} />
            <Route path="/seller-policy" element={<PolicyPage title="Seller Policy" subtitle="Seller obligations and standards" body="Sellers must maintain accurate listings, fulfill obligations, and abide by the marketplace's quality and conduct guidelines." />} />
            <Route path="/auction-rules" element={<PolicyPage title="Auction Rules" subtitle="Rules governing bidding" body="Users must review reserve prices, bid increments, and auction timing before placing a bid or entering a live auction." />} />
            <Route path="/help" element={<PolicyPage title="Help Center" subtitle="Support and assistance" body="The help center provides guidance for account setup, order issues, disputes, and seller onboarding." />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/marketplace/:id" element={<ProductDetailPage />} />
            <Route path="/auction/:id" element={<AuctionDetailPage />} />
            <Route path="/seller/:id" element={<SellerProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route path="/auctions/:id" element={<AuctionDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/welcome/customer" element={<CustomerWelcome />} />
            <Route path="/welcome/vendor" element={<VendorWelcome />} />
            <Route path="/register/customer" element={<CustomerRegisterPage />} />
            <Route path="/register/vendor" element={<VendorRegisterPage />} />
            <Route path="/otp" element={<OTPPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/kyc" element={<KYCPage />} />
            <Route path="/registration-fee" element={<RegistrationFeePage />} />
            <Route path="/customer/registration-fee" element={<RegistrationFeePage />} />
            <Route path="/dashboards/customer" element={<CustomerDashboardPage />} />
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
            <Route path="/customer/orders" element={<CustomerOrdersPage />} />
            <Route path="/customer/orders/:id" element={<CustomerOrderDetailPage />} />
            <Route path="/customer/auctions/live" element={<CustomerAuctionsPage />} />
            <Route path="/customer/auctions/upcoming" element={<CustomerAuctionsPage />} />
            <Route path="/customer/auctions/won" element={<CustomerWonAuctionsPage />} />
            <Route path="/customer/auctions" element={<CustomerAuctionsPage />} />
            <Route path="/customer/auctions/:id" element={<CustomerAuctionDetailPage />} />
            <Route path="/customer/wallet" element={<WalletPage />} />
            <Route path="/customer/wallet/transactions" element={<CustomerTransactionsPage />} />
            <Route path="/customer/bids" element={<CustomerBidsPage />} />
            <Route path="/customer/won" element={<CustomerWonAuctionsPage />} />
            <Route path="/customer/wishlist" element={<CustomerWishlistPage />} />
            <Route path="/customer/recently-viewed" element={<CustomerRecentlyViewedPage />} />
            <Route path="/customer/saved-searches" element={<CustomerSavedSearchesPage />} />
            <Route path="/customer/transactions" element={<CustomerTransactionsPage />} />
            <Route path="/customer/addresses" element={<CustomerAddressesPage />} />
            <Route path="/customer/messages" element={<CustomerMessagesPage />} />
            <Route path="/customer/notifications" element={<NotificationsPage />} />
            <Route path="/customer/reviews" element={<CustomerReviewsPage />} />
            <Route path="/customer/support" element={<CustomerSupportPage />} />
            <Route path="/customer/invoices" element={<CustomerInvoicesPage />} />
            <Route path="/customer/settings" element={<CustomerSettingsPage />} />
            <Route path="/customer/search-products" element={<CustomerSearchPage />} />
            <Route path="/customer/filter-products" element={<CustomerFilterPage />} />
            <Route path="/customer/category" element={<CustomerCategoryPage />} />
            <Route path="/customer/product/:id" element={<CustomerProductPage />} />
            <Route path="/customer/seller/:id" element={<CustomerSellerPage />} />
            <Route path="/customer/watch-auction" element={<CustomerWatchAuctionPage />} />
            <Route path="/customer/place-bid" element={<CustomerPlaceBidPage />} />
            <Route path="/customer/bid-confirmation" element={<CustomerBidConfirmationPage />} />
            <Route path="/customer/wallet-payment" element={<CustomerWalletPaymentPage />} />
            <Route path="/customer/auction-live" element={<CustomerAuctionLivePage />} />
            <Route path="/customer/winner" element={<CustomerWinnerPage />} />
            <Route path="/customer/checkout" element={<CustomerCheckoutPage />} />
            <Route path="/customer/address" element={<CustomerAddressPage />} />
            <Route path="/customer/shipping" element={<CustomerShippingPage />} />
            <Route path="/customer/payment" element={<CustomerPaymentPage />} />
            <Route path="/customer/order-success" element={<CustomerOrderSuccessPage />} />
            <Route path="/customer/invoice" element={<CustomerInvoicePage />} />
            <Route path="/customer/track-order" element={<CustomerTrackOrderPage />} />
            <Route path="/customer/delivered" element={<CustomerDeliveredPage />} />
            <Route path="/customer/review" element={<CustomerReviewPage />} />
            <Route path="/customer/buynow-confirm" element={<BuyNowConfirmPage />} />
            <Route path="/customer/buynow-payment" element={<BuyNowPaymentPage />} />
            <Route path="/customer/buynow-success" element={<BuyNowOrderSuccessPage />} />
            <Route path="/customer/buynow-invoice" element={<BuyNowInvoicePage />} />
            <Route path="/dashboards/vendor" element={<VendorDashboardPage />} />
            <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
            <Route path="/vendor/business-info" element={<VendorBusinessInfoPage />} />
            <Route path="/vendor/gst" element={<VendorGstPage />} />
            <Route path="/vendor/bank" element={<VendorBankPage />} />
            <Route path="/vendor/identity" element={<VendorIdentityPage />} />
            <Route path="/vendor/store-verification" element={<VendorStoreVerificationPage />} />
            <Route path="/vendor/store-profile" element={<VendorStoreProfilePage />} />
            <Route path="/vendor/store-settings" element={<VendorStoreSettingsPage />} />
            <Route path="/vendor/subscription" element={<VendorSubscriptionPage />} />
            <Route path="/vendor/wallet" element={<VendorWalletPage />} />
            <Route path="/vendor/withdraw" element={<VendorWithdrawPage />} />
            <Route path="/vendor/analytics" element={<VendorSalesAnalyticsPage />} />
            <Route path="/vendor/orders" element={<VendorOrdersPage />} />
            <Route path="/vendor/customers" element={<VendorCustomersPage />} />
            <Route path="/vendor/inventory" element={<VendorInventoryPage />} />
            <Route path="/vendor/products" element={<VendorProductsPage />} />
            <Route path="/vendor/create-product" element={<VendorCreateProductPage />} />
            <Route path="/vendor/edit-product" element={<VendorEditProductPage />} />
            <Route path="/vendor/variants" element={<VendorProductVariantsPage />} />
            <Route path="/vendor/create-product" element={<VendorCreateProductPage />} />
            <Route path="/vendor/edit-product" element={<VendorEditProductPage />} />
            <Route path="/vendor/delete-product" element={<VendorDeleteProductPage />} />
            <Route path="/vendor/create-auction" element={<VendorCreateAuctionPage />} />
            <Route path="/vendor/create-product-wizard" element={<VendorCreateProductWizardPage />} />
            <Route path="/vendor/edit-product-wizard/:id" element={<VendorEditProductWizardPage />} />
            <Route path="/vendor/create-auction-wizard" element={<VendorCreateAuctionWizardPage />} />
            <Route path="/vendor/edit-auction" element={<VendorEditAuctionPage />} />
            <Route path="/vendor/auction-analytics" element={<VendorAuctionAnalyticsPage />} />
            <Route path="/vendor/messages" element={<VendorMessagesPage />} />
            <Route path="/vendor/notifications" element={<VendorNotificationsPage />} />
            <Route path="/vendor/wallet" element={<WalletPage />} />
            <Route path="/vendor/reports" element={<VendorReportsPage />} />
            <Route path="/vendor/settings" element={<VendorStoreSettingsPage />} />
            <Route path="/vendor/reviews" element={<VendorReviewsPage />} />
            <Route path="/vendor/support" element={<VendorSupportTicketsPage />} />
            <Route path="/vendor/reports" element={<VendorReportsPage />} />
            <Route path="/dashboards/admin" element={<AdminDashboardApiPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardApiPage />} />
            <Route path="/admin/organization-hierarchy" element={<OrganizationHierarchyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/franchises" element={<FranchiseManagementPage />} />
            <Route path="/admin/locations" element={<LocationManagementPage />} />
            <Route path="/admin/roles" element={<RolePermissionPage />} />
            <Route path="/admin/franchise-dashboard" element={<FranchiseDashboardPage />} />
            <Route path="/admin/franchise" element={<FranchiseManagementAdminPage />} />
            <Route path="/admin/users" element={<AdminResourcePage resource="users" />} />
            <Route path="/admin/customers" element={<AdminResourcePage resource="customers" />} />
            <Route path="/admin/products" element={<AdminResourcePage resource="products" />} />
            <Route path="/admin/payments" element={<AdminResourcePage resource="payments" />} />
            <Route path="/admin/vendors" element={<AdminResourcePage resource="vendors" />} />
            <Route path="/admin/orders" element={<AdminResourcePage resource="orders" />} />
            <Route path="/admin/delivery" element={<DeliveryManagementAdminPage />} />
            <Route path="/admin/wallet" element={<WalletManagementAdminPage />} />
            <Route path="/admin/auctions" element={<AdminResourcePage resource="auctions" />} />
            <Route path="/admin/content" element={<ContentManagementAdminPage />} />
            <Route path="/admin/super-dashboard" element={<AdminDashboardApiPage />} />
            <Route path="/admin/permissions" element={<RolePermissionMatrixPage />} />
            <Route path="/admin/approvals" element={<ApprovalCenterPage />} />
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
            <Route path="/admin/cms" element={<CMSPage />} />
            <Route path="/admin/cms/banners" element={<CMSBannersPage />} />
            <Route path="/admin/cms/categories" element={<CMSCategoriesPage />} />
            <Route path="/admin/cms/faq" element={<CMSFaqPage />} />
            <Route path="/admin/cms/blog" element={<CMSBlogPage />} />
            <Route path="/admin/cms/testimonials" element={<CMSTestimonialsPage />} />
            <Route path="/admin/cms/newsletter" element={<CMSNewsletterPage />} />
            <Route path="/admin/cms/pages" element={<CMSPagesPage />} />
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
            <Route path="/admin/settings/general" element={<SettingsGeneralPage />} />
            <Route path="/admin/settings/auction-rules" element={<SettingsAuctionRulesPage />} />
            <Route path="/admin/settings/registration-fee" element={<SettingsRegistrationFeePage />} />
            <Route path="/admin/settings/commission-rules" element={<SettingsCommissionRulesPage />} />
            <Route path="/admin/settings/platform-charges" element={<SettingsPlatformChargesPage />} />
            <Route path="/admin/settings/shipping-rules" element={<SettingsShippingRulesPage />} />
            <Route path="/admin/settings/tax" element={<SettingsTaxPage />} />
            <Route path="/admin/settings/email" element={<SettingsEmailPage />} />
            <Route path="/admin/settings/sms" element={<SettingsSmsPage />} />
            <Route path="/admin/settings/notification-templates" element={<SettingsNotificationTemplatesPage />} />
            <Route path="/admin/settings/security" element={<SettingsSecurityPage />} />
            <Route path="/admin/settings/localization" element={<SettingsLocalizationPage />} />
            <Route path="/admin/approvals" element={<ApprovalCenterPage />} />
            <Route path="/admin/approvals/vendors" element={<ApprovalVendorsPage />} />
            <Route path="/admin/approvals/franchises" element={<ApprovalFranchisesPage />} />
            <Route path="/admin/approvals/products" element={<ApprovalProductsPage />} />
            <Route path="/admin/approvals/auctions" element={<ApprovalAuctionsPage />} />
            <Route path="/admin/approvals/kyc" element={<ApprovalKycPage />} />
            <Route path="/admin/permissions" element={<RolePermissionMatrixPage />} />
            <Route path="/admin/permissions/roles" element={<PermissionsRolesPage />} />
            <Route path="/admin/permissions/roles/create" element={<PermissionsRoleCreatePage />} />
            <Route path="/admin/permissions/roles/:id" element={<PermissionsRoleDetailPage />} />
            <Route path="/admin/permissions/matrix" element={<PermissionsMatrixPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/reports/sales" element={<ReportsSalesPage />} />
            <Route path="/admin/reports/revenue" element={<AdminReportApiPage report="revenue" />} />
            <Route path="/admin/reports/auctions" element={<AdminReportApiPage report="auctions" />} />
            <Route path="/admin/reports/vendors" element={<AdminReportApiPage report="users" />} />
            <Route path="/admin/reports/customers" element={<AdminReportApiPage report="users" />} />
            <Route path="/admin/reports/orders" element={<AdminReportApiPage report="orders" />} />
            <Route path="/admin/reports/payments" element={<AdminReportApiPage report="payments" />} />
            <Route path="/admin/reports/delivery" element={<ReportsDeliveryPage />} />
            <Route path="/admin/reports/wallet" element={<ReportsWalletPage />} />
            <Route path="/admin/reports/commission" element={<ReportsCommissionPage />} />
            <Route path="/admin/reports/franchise" element={<ReportsFranchisePage />} />
            <Route path="/admin/franchise" element={<FranchiseManagementAdminPage />} />
            <Route path="/admin/franchise/create" element={<AdminFranchiseCreatePage />} />
            <Route path="/admin/franchise/:id" element={<AdminFranchiseDetailPage />} />
            <Route path="/admin/franchise/:id/edit" element={<AdminFranchiseEditPage />} />
            <Route path="/admin/franchise/:id/vendors" element={<AdminFranchiseVendorsPage />} />
            <Route path="/admin/franchise/:id/orders" element={<AdminFranchiseOrdersPage />} />
            <Route path="/admin/franchise/:id/performance" element={<AdminFranchisePerformancePage />} />
            <Route path="/admin/vendors" element={<AdminResourcePage resource="vendors" />} />
            <Route path="/admin/vendors/:id" element={<AdminResourceDetailPage resource="vendors" />} />
            <Route path="/admin/vendors/:id/edit" element={<AdminVendorEditPage />} />
            <Route path="/admin/vendors/:id/products" element={<AdminVendorProductsPage />} />
            <Route path="/admin/vendors/:id/auctions" element={<AdminVendorAuctionsPage />} />
            <Route path="/admin/vendors/:id/orders" element={<AdminVendorOrdersPage />} />
            <Route path="/admin/vendors/:id/wallet" element={<AdminVendorWalletPage />} />
            <Route path="/admin/vendors/:id/kyc" element={<AdminVendorKycPage />} />
            <Route path="/admin/vendors/:id/performance" element={<AdminVendorPerformancePage />} />
            <Route path="/admin/orders" element={<AdminResourcePage resource="orders" />} />
            <Route path="/admin/orders/:id" element={<AdminResourceDetailPage resource="orders" />} />
            <Route path="/admin/delivery" element={<DeliveryManagementAdminPage />} />
            <Route path="/admin/delivery/partners" element={<DeliveryPartnersPage />} />
            <Route path="/admin/delivery/partners/:id" element={<DeliveryPartnerDetailPage />} />
            <Route path="/admin/delivery/assignments" element={<DeliveryAssignmentsPage />} />
            <Route path="/admin/delivery/performance" element={<DeliveryPerformancePage />} />
            <Route path="/admin/wallet" element={<WalletManagementAdminPage />} />
            <Route path="/admin/wallet/transactions" element={<WalletTransactionsPage />} />
            <Route path="/admin/wallet/withdrawals" element={<WalletWithdrawalsPage />} />
            <Route path="/admin/wallet/refunds" element={<WalletRefundsPage />} />
            <Route path="/admin/wallet/settlements" element={<WalletSettlementsPage />} />
            <Route path="/admin/wallet/commissions" element={<WalletCommissionsPage />} />
            <Route path="/admin/wallet/transactions/:id" element={<WalletTransactionDetailPage />} />
            <Route path="/admin/auctions" element={<AdminResourcePage resource="auctions" />} />
            <Route path="/admin/auctions/live" element={<AuctionLivePage />} />
            <Route path="/admin/auctions/upcoming" element={<AuctionUpcomingPage />} />
            <Route path="/admin/auctions/completed" element={<AuctionCompletedPage />} />
            <Route path="/admin/auctions/pending" element={<AuctionPendingPage />} />
            <Route path="/admin/auctions/:id" element={<AdminResourceDetailPage resource="auctions" />} />
            <Route path="/admin/auctions/:id/bids" element={<AuctionBidHistoryPage />} />
            <Route path="/admin/content" element={<ContentManagementAdminPage />} />
            <Route path="/admin/content/categories" element={<ContentCategoriesPage />} />
            <Route path="/admin/content/banners" element={<ContentBannersPage />} />
            <Route path="/admin/content/announcements" element={<ContentAnnouncementsPage />} />
            <Route path="/admin/content/notifications" element={<ContentNotificationsPage />} />
            <Route path="/admin/content/faq" element={<ContentFaqPage />} />
            <Route path="/admin/content/help" element={<ContentHelpPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/wallet/add-money" element={<AddMoneyPage />} />
            <Route path="/wallet/withdraw" element={<WithdrawPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/admin" element={<AdminChatPage />} />
            <Route path="/chat/support" element={<SupportChatPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/sub" element={<SubCategoriesPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/recommended" element={<RecommendedPage />} />
            <Route path="/auctions/live" element={<LiveAuctionsPage />} />
            <Route path="/auctions/upcoming" element={<UpcomingAuctionsPage />} />
            <Route path="/auctions/ended" element={<EndedAuctionsPage />} />
            <Route path="/auctions/winner" element={<WinnerScreenPage />} />
            <Route path="/support-tickets" element={<SupportTicketsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/commission-settings" element={<CommissionSettingsPage />} />
            <Route path="/refunds" element={<RefundsPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/coming-soon" element={<ComingSoonPage />} />
            <Route path="/*" element={<NotFoundPage />} />
                  </Routes>
                  </AppRouteGuard>
                </AnimatePresence>
                </Layout>
              </ThemeProvider>
            </LocaleProvider>
          </NotificationProvider>
        </WalletProvider>
      </CartProvider>
    </UserProvider>
    </AuthProvider>
  );
}

export default App;
