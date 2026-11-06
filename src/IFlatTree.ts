/**
 * A tree as two parallel arrays in pre-order: each node's model and how many
 * children it has. Unlike {@link IParseable}, its nesting depth does not grow
 * with the tree's, so it suits channels that cap object depth (Electron's
 * contextBridge refuses objects nested deeper than 1000).
 * @public
 */
export interface IFlatTree<T> {
  models: T[];
  childCounts: number[];
}
