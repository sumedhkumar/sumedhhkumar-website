type ProductAccessReference = {
  productId: string;
  secureReference: string;
};

const productAccessReferences: ProductAccessReference[] = [];

export function getProductAccessReference(productId: string) {
  return (
    productAccessReferences.find((reference) => reference.productId === productId)
      ?.secureReference ?? ""
  );
}
