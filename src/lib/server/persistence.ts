import { isProductionPersistenceConfigured } from "@/lib/config";

export function hasProductionPersistence() {
  return isProductionPersistenceConfigured();
}

export function persistenceLaunchBlocker() {
  return !hasProductionPersistence();
}
