// Services folder - Add your service files here

// Export Auth services
export {
  loginUser,
  registerUser,
  logoutUserAPI,
  storeAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
  logoutUser,
  logoutUserLocal,
  extendSession,
  getRemainingSessionTime,
  AuthError,

  refreshAccessToken,
  ensureValidToken,
  
  // User info helpers
  storeUserInfo,
  getUserInfo,
  getUserRole,
  removeUserInfo,
  decodeJWTToken,
  
  // Google Auth functions
  loginWithGoogle,
  handleGoogleAuthSuccess,
  isGoogleAuthCallback,
  
  // User ID helper
  getCurrentUserId
} from './Auth'

// Export User services
export {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getSellerProfile,
} from './User'

// Export Contract services
export {
  createSellerContract,
  signContractAsSeller,
  signContractAsBuyer,
  getContractByVehicleId,
  getUserContracts,
  deleteContract,
} from './Contract'

// Export Battery services
export {
  createBattery,
  getBatteries,
  getAllBatteries,
  getBatteryById,
  getMyBatteries,
  updateBattery,
  deleteBattery
} from './Battery'

// Export Vehicle services
export {
  getVehicles,
  getAllVehicles,
  getVehicleById,
  getMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from './Vehicle'

// Export Wallet services
export {
  getWalletBalance,
  makeDeposit,
  formatCurrency,
  openPaymentUrl,
  isMoMoPayment,
  WalletError
} from './Wallet'

// Export Chatbot services
export {
  sendChatMessage,
  parseVehicleLinks,
  formatChatMessage
} from './Chatbot'

// Export Transaction services
export {
  getMyTransactions,
  getMySales,
  getStatusColor,
  getPaymentGatewayName,
  payAuctionTransaction,
  getPendingAuctionTransaction,
  shipTransaction,
  confirmReceipt,
  disputeTransaction
} from './Transaction'

// Export Auction services
export {
  getLiveAuctions,
  getAuctionDetail,
  placeBid,
  payDeposit,
  formatAuctionPrice,
  getTimeRemaining,
  requestAuction,
  createAuction
} from './Auction'

// Export Admin services
export {
  getAuctionRequests,
  reviewAuctionRequest,
  approveListing,
  getAdminStats
} from './Admin'

// Export types
export type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  ApiError,
  
  // Google Auth types
  GoogleAuthResponse
} from './Auth'

export type {
  User,
  UserProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  SellerProfile,
  SellerProfileResponse,
  Review,
  VerifiedSeller,
  VerifiedSellersResponse
} from './User'

export type {
  Battery,
  BatteriesResponse
} from './Battery'

export type {
  Vehicle,
  VehiclesResponse,
  VehicleResponse
} from './Vehicle'

export type {
  WalletData,
  WalletResponse,
  DepositRequest,
  DepositResponse
} from './Wallet'

export type {
  ChatMessage,
  ChatbotResponse
} from './Chatbot'

export type {
  Transaction,
  TransactionReview,
  TransactionVehicle,
  TransactionBattery,
  TransactionsResponse,
  PayAuctionRequest,
  PayAuctionResponse,
  ShipTransactionResponse,
  ConfirmReceiptResponse,
  DisputeTransactionResponse
} from './Transaction'

export type {
  LiveAuction,
  LiveAuctionsResponse,
  Bid,
  BidResponse,
  Deposit,
  AuctionDepositResponse,
  PlaceBidRequest,
  PayDepositRequest,
  AuctionSeller,
  AuctionSpecifications
} from '../types/auction'

export type {
  RequestAuctionData,
  RequestAuctionResponse,
  CreateAuctionResponse
} from './Auction'