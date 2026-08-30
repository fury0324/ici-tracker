export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetails: { productId: string };
  AddProduct: { productId?: string } | undefined;
};

export type POSStackParamList = {
  POSMain: undefined;
  Checkout: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type ReportsStackParamList = {
  ReportsMain: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Products: undefined;
  POS: undefined;
  Reports: undefined;
};
