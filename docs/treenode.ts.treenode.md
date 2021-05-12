<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [TreeNode.ts](./treenode.ts.md) &gt; [TreeNode](./treenode.ts.treenode.md)

## TreeNode class


<b>Signature:</b>

```typescript
export declare class TreeNode<T> 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(model, parent, children)](./treenode.ts.treenode._constructor_.md) |  | Constructs a new instance of the <code>TreeNode</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [children](./treenode.ts.treenode.children.md) |  | [TreeNode](./treenode.ts.treenode.md)<!-- -->&lt;T&gt;\[\] |  |
|  [hasChildren](./treenode.ts.treenode.haschildren.md) |  | boolean | Returns true if the node has children. |
|  [index](./treenode.ts.treenode.index.md) |  | number | Index of the node among its siblings. |
|  [model](./treenode.ts.treenode.model.md) |  | T |  |
|  [parent](./treenode.ts.treenode.parent.md) |  | [TreeNode](./treenode.ts.treenode.md)<!-- -->&lt;T&gt; \| null |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [add(child)](./treenode.ts.treenode.add.md) |  | Add node as a child. |
|  [breadth(callback)](./treenode.ts.treenode.breadth.md) |  | Breadth-first search, return true in the callback to end iteration. |
|  [clone()](./treenode.ts.treenode.clone.md) |  | Returns a shallow-copy. |
|  [drop()](./treenode.ts.treenode.drop.md) |  | Remove current node and its children from the tree and return. |
|  [flatten(method)](./treenode.ts.treenode.flatten.md) |  | Returns a list of nodes. |
|  [map(callback)](./treenode.ts.treenode.map.md) |  | Iterates over a node's children and returns a new root node. |
|  [parse(tree)](./treenode.ts.treenode.parse.md) | <code>static</code> | Parses object into a tree and returns the root node. |
|  [path()](./treenode.ts.treenode.path.md) |  | Returns list of nodes to the root. |
|  [post(callback)](./treenode.ts.treenode.post.md) |  | Depth-first post-order search, return true in the callback to end iteration. |
|  [pre(callback)](./treenode.ts.treenode.pre.md) |  | Depth-first pre-order search, return true in the callback to end iteration. |
|  [toObject()](./treenode.ts.treenode.toobject.md) |  | Returns an object representation of the tree. |
