import { IParseable } from "./IParseable";

/**
 * Search callback passed to `.pre`, `.post`, and `.breadth`.
 * @public
 */
export type SearchCallback<T> = (node: TreeNode<T>) => boolean | void;

/**
 * Search methods on TreeNode, passed to `.flatten`.
 * @public
 */
export type SearchStrategy = "pre" | "post" | "breadth";

/**
 * @public
 */
export class TreeNode<T> {
  constructor(
    public model: T,
    public parent: TreeNode<T> | null = null,
    public children: TreeNode<T>[] = []
  ) {}

  /**
   * Parses object into a tree and returns the root node.
   */
  static parse<T>(tree: IParseable<T>): TreeNode<T> {
    const node = new TreeNode(tree.model);
    tree.children.forEach((child) => node.add(TreeNode.parse(child)));
    return node;
  }

  /**
   * Index of the node among its siblings.
   */
  get index(): number {
    if (!this.parent) return 0;
    return this.parent.children.indexOf(this);
  }

  /**
   * Indices from the root to the node.
   */
  get indices(): number[] {
    if (!this.parent) return []; // Root
    return [...this.parent.indices, this.index];
  }

  /**
   * Returns true if the node has children.
   */
  get hasChildren(): boolean {
    return this.children.length > 0;
  }

  /**
   * Add node as a child.
   */
  add(child: TreeNode<T>): TreeNode<T> {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  /**
   * Add model as a child.
   */
  addModel(model: T): TreeNode<T> {
    return this.add(new TreeNode<T>(model));
  }

  /**
   * Remove current node and its children from the tree and return.
   */
  drop(): TreeNode<T> {
    if (this.parent !== null) {
      const idx = this.parent.children.indexOf(this);
      this.parent.children.splice(idx, 1);
      this.parent = null;
    }
    return this;
  }

  /**
   * Returns a shallow-copy.
   */
  clone(): TreeNode<T> {
    const node = new TreeNode<T>(this.model);
    node.children = this.children.map((child) => {
      const newChild = child.clone();
      newChild.parent = node;
      return newChild;
    });
    return node;
  }

  /**
   * Returns a node given a list of indices
   */
  fetch(indices: number[]): TreeNode<T> | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode<T> = this;
    for (const i of indices) {
      node = node.children[i];
      if (!node) return null;
    }
    return node || null;
  }

  /**
   * Returns list of nodes to the root.
   */
  path(): TreeNode<T>[] {
    const path: TreeNode<T>[] = [];
    const addToPath = (node: TreeNode<T>) => {
      path.unshift(node);
      if (node.parent) addToPath(node.parent);
    };
    addToPath(this);
    return path;
  }

  /**
   * Iterates over a node's children and returns a new root node.
   */
  map<U>(callback: (node: TreeNode<T>) => U): TreeNode<U> {
    const node = new TreeNode<U>(callback(this));
    node.children = this.children.map((child) => {
      const newChild = child.map(callback);
      newChild.parent = node;
      return newChild;
    });
    return node;
  }

  /**
   * Iterates over a node's children and returns a new root node.
   */
  async mapAsync<U>(callback: (node: TreeNode<T>, parent?: TreeNode<U>) => Promise<U>, parent?: TreeNode<U>): Promise<TreeNode<U>>{
    const node = new TreeNode<U>(await callback(this, parent));
    node.children = await Promise.all(this.children.map(async (child) => {
      const newChild = await child.mapAsync(callback, node);
      newChild.parent = node;
      return newChild;
    }));
    return node;
  }

  /**
   * Breadth-first search, return true in the callback to end iteration.
   */
  breadth(callback: SearchCallback<T>): TreeNode<T> | null {
    const queue: TreeNode<T>[] = [this];

    while (queue.length) {
      const node = queue.shift() as TreeNode<T>;
      if (callback(node)) return node;
      for (let i = 0, childCount = node.children.length; i < childCount; i++) {
        queue.push(node.children[i]);
      }
    }

    return null;
  }

  /**
   * Depth-first pre-order search, return true in the callback to end iteration.
   */
  pre(callback: SearchCallback<T>): TreeNode<T> | null {
    if (callback(this)) return this;

    for (let i = 0, childCount = this.children.length; i < childCount; i++) {
      const node = this.children[i].pre(callback);
      if (node) return node;
    }

    return null;
  }

  /**
   * Depth-first post-order search, return true in the callback to end iteration.
   */
  post(callback: SearchCallback<T>): TreeNode<T> | null {
    for (let i = 0, childCount = this.children.length; i < childCount; i++) {
      const node = this.children[i].post(callback);
      if (node) return node;
    }

    if (callback(this)) return this;

    return null;
  }

  /**
   * Returns a list of nodes.
   */
  flatten(method: SearchStrategy): TreeNode<T>[] {
    const list: TreeNode<T>[] = [];
    this[method].call(this, (node) => {
      list.push(node);
    });
    return list;
  }

  /**
   * Returns an object representation of the tree.
   */
  toObject(): IParseable<T> {
    return {
      model: this.model,
      children: this.children.map((child) => child.toObject()),
    };
  }
}
