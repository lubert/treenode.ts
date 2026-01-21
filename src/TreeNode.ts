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
  private _index: number = 0;
  private _children: TreeNode<T>[] = [];

  constructor(
    public model: T,
    public parent: TreeNode<T> | null = null,
    children: TreeNode<T>[] = []
  ) {
    this._children = children;
  }

  /**
   * Returns the children of the node as a readonly array.
   * Use add(), drop(), or swap() to modify children.
   */
  get children(): readonly TreeNode<T>[] {
    return this._children;
  }

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
    return this._index;
  }

  /**
   * Indices from the root to the node.
   */
  get indices(): number[] {
    const indices: number[] = [];
    let node: TreeNode<T> | null = this;
    while (node.parent) {
      indices.push(node.index);
      node = node.parent;
    }
    return indices.reverse();
  }

  /**
   * Compressed path key: positive = run of first-children, negative = child index.
   * e.g. [0,0,0,1,0,0] -> "3,-1,2"
   */
  get pathKey(): string {
    const indices = this.indices;
    if (indices.length === 0) return '';

    const parts: number[] = [];
    let zeroCount = 0;

    for (const idx of indices) {
      if (idx === 0) {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          parts.push(zeroCount);
          zeroCount = 0;
        }
        parts.push(-idx);
      }
    }

    if (zeroCount > 0) {
      parts.push(zeroCount);
    }

    return parts.join(',');
  }

  /**
   * Returns true if the node has children.
   */
  get hasChildren(): boolean {
    return this._children.length > 0;
  }

  /**
   * Returns true if the node is the root (has no parent).
   */
  get isRoot(): boolean {
    return this.parent === null;
  }

  /**
   * Returns true if the node is a leaf (has no children).
   */
  get isLeaf(): boolean {
    return !this.hasChildren;
  }

  /**
   * Returns the root node of the tree.
   */
  get root(): TreeNode<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode<T> = this;
    while (node.parent) {
      node = node.parent;
    }
    return node;
  }

  /**
   * Returns the depth of the node (root is 0).
   */
  get depth(): number {
    return this.parent ? this.parent.depth + 1 : 0;
  }

  /**
   * Returns siblings of this node (excluding self).
   */
  get siblings(): TreeNode<T>[] {
    if (this.isRoot) return [];
    return this.parent!.children.filter((child) => child !== this);
  }

  /**
   * Add node as a child.
   * @param child - The node to add
   * @param index - Optional index to insert at. If omitted, appends to end.
   * @throws RangeError if index is out of bounds (negative or > children.length)
   */
  add(child: TreeNode<T>, index?: number): TreeNode<T> {
    child.parent = this;
    if (index === undefined) {
      // Append at end
      child._index = this._children.length;
      this._children.push(child);
    } else {
      // Validate index
      if (index < 0 || index > this._children.length) {
        throw new RangeError(`Invalid index: ${index}. Valid range: 0 to ${this._children.length}`);
      }
      // Insert at specific index
      this._children.splice(index, 0, child);
      // Update indices for inserted and subsequent siblings
      for (let i = index; i < this._children.length; i++) {
        this._children[i]._index = i;
      }
    }
    return child;
  }

  /**
   * Swap children at indices i and j.
   * @param i - First index
   * @param j - Second index
   */
  swap(i: number, j: number): void {
    if (i < 0 || j < 0 || i >= this._children.length || j >= this._children.length) {
      throw new RangeError(`Invalid indices: ${i}, ${j}. Children length: ${this._children.length}`);
    }
    if (i === j) return;
    const temp = this._children[i];
    this._children[i] = this._children[j];
    this._children[j] = temp;
    this._children[i]._index = i;
    this._children[j]._index = j;
  }

  /**
   * Add model as a child.
   * @param model - The model to add
   * @param index - Optional index to insert at. If omitted, appends to end.
   */
  addModel(model: T, index?: number): TreeNode<T> {
    return this.add(new TreeNode<T>(model), index);
  }

  /**
   * Remove current node and its children from the tree and return.
   */
  drop(): TreeNode<T> {
    if (!this.isRoot) {
      const idx = this._index;
      const parentChildren = (this.parent as TreeNode<T>)._children;
      parentChildren.splice(idx, 1);
      // Update indices of subsequent siblings
      for (let i = idx; i < parentChildren.length; i++) {
        parentChildren[i]._index = i;
      }
      this.parent = null;
      this._index = 0;
    }
    return this;
  }

  /**
   * Returns a deep copy of structure, shallow copy of model.
   */
  clone(): TreeNode<T> {
    const node = new TreeNode<T>(this.model);
    node._children = this._children.map((child, i) => {
      const newChild = child.clone();
      newChild.parent = node;
      newChild._index = i;
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
    return node;
  }

  /**
   * Returns a node given a pathKey string.
   * @see pathKey
   */
  fetchByPathKey(pathKey: string): TreeNode<T> | null {
    if (pathKey === '') return this;

    const indices: number[] = [];
    const parts = pathKey.split(',').map(Number);

    for (const part of parts) {
      if (part >= 0) {
        for (let i = 0; i < part; i++) {
          indices.push(0);
        }
      } else {
        indices.push(-part);
      }
    }

    return this.fetch(indices);
  }

  /**
   * Returns list of nodes to the root.
   */
  path(): TreeNode<T>[] {
    const path: TreeNode<T>[] = [];
    let node: TreeNode<T> | null = this;
    while (node) {
      path.push(node);
      node = node.parent;
    }
    return path.reverse();
  }

  /**
   * Iterates over a node's children and returns a new root node.
   */
  map<U>(callback: (node: TreeNode<T>) => U): TreeNode<U> {
    const node = new TreeNode<U>(callback(this));
    node._children = this._children.map((child, i) => {
      const newChild = child.map(callback);
      newChild.parent = node;
      newChild._index = i;
      return newChild;
    });
    return node;
  }

  /**
   * Iterates over a node's children and returns a new root node.
   */
  async mapAsync<U>(callback: (node: TreeNode<T>, parent: TreeNode<U> | undefined) => Promise<U>, parent?: TreeNode<U>): Promise<TreeNode<U>>{
    const node = new TreeNode<U>(await callback(this, parent));
    node._children = await Promise.all(this._children.map(async (child, i) => {
      const newChild = await child.mapAsync(callback, node);
      newChild.parent = node;
      newChild._index = i;
      return newChild;
    }));
    return node;
  }

  /**
   * Breadth-first search, return true in the callback to end iteration.
   */
  breadth(callback: SearchCallback<T>): TreeNode<T> | null {
    const queue: TreeNode<T>[] = [this];
    let head = 0;

    while (head < queue.length) {
      const node = queue[head++];
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
   * Find the first node matching the predicate.
   */
  find(predicate: (node: TreeNode<T>) => boolean, method: SearchStrategy = "pre"): TreeNode<T> | null {
    return this[method]((node) => predicate(node));
  }

  /**
   * Find all nodes matching the predicate.
   */
  findAll(predicate: (node: TreeNode<T>) => boolean, method: SearchStrategy = "pre"): TreeNode<T>[] {
    const results: TreeNode<T>[] = [];
    this[method]((node) => {
      if (predicate(node)) results.push(node);
    });
    return results;
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
