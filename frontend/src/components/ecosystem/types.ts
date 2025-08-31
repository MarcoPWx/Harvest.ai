export interface EcosystemWidgetProps {
  currentProduct: "devmentor" | "quizmentor" | "harvest" | "omni";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  userTier?: "free" | "pro" | "team" | "enterprise";
  onProductClick?: (productId: string) => void;
  theme?: "dark" | "light";
}

export interface Product {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
  status: "active" | "locked" | "beta" | "free";
  badge?: string;
}
