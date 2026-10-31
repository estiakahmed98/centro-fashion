export type CartLineReference = {
  id?: string | number;
  productId: string | number;
  variantId?: string | number | null;
  pcBuildId?: string | null;
  pcBuildSlot?: string | null;
  lineKey?: string | null;
  bundleConfigurationKey?: string | null;
};

export function isSameCartLine(
  serverItem: CartLineReference,
  localItem: CartLineReference,
) {
  if (String(serverItem.productId) !== String(localItem.productId)) {
    return false;
  }

  if (serverItem.pcBuildId || localItem.pcBuildId) {
    return (
      serverItem.pcBuildId === localItem.pcBuildId &&
      serverItem.pcBuildSlot === localItem.pcBuildSlot &&
      String(serverItem.variantId ?? "") === String(localItem.variantId ?? "")
    );
  }

  const sameLine =
    String(serverItem.lineKey ?? "standard") ===
    String(localItem.bundleConfigurationKey ?? "standard");
  const sameVariant =
    String(serverItem.variantId ?? "") === String(localItem.variantId ?? "") ||
    (!localItem.variantId &&
      serverItem.variantId != null &&
      !localItem.bundleConfigurationKey);

  return sameLine && sameVariant;
}

export function getStaleServerCartItems<T extends CartLineReference>(
  serverItems: T[],
  localItems: CartLineReference[],
) {
  return serverItems.filter(
    (serverItem) =>
      !localItems.some((localItem) => isSameCartLine(serverItem, localItem)),
  );
}
