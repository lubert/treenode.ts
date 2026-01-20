import { IParseable } from "../src/IParseable";
import { TreeNode, SearchStrategy } from "../src/TreeNode";

describe("TreeNode", () => {
  const tree: IParseable<string> = {
    model: "1",
    children: [
      {
        model: "11",
        children: [
          {
            model: "111",
            children: [],
          },
          {
            model: "112",
            children: [],
          },
        ],
      },
      {
        model: "12",
        children: [],
      },
    ],
  };
  const root = TreeNode.parse(tree);
  const mapModel = <T>(node: TreeNode<T>, method: SearchStrategy) => {
    return node.flatten(method).map((node) => node.model);
  };

  describe(".index", () => {
    it("returns the expected index", () => {
      expect(root.children[0].index).toEqual(0);
      expect(root.children[1].index).toEqual(1);
    });
  });

  describe(".indices", () => {
    it("returns the expected indices", () => {
      expect(root.indices).toEqual([]);
      expect(root.children[0].children[0].indices).toEqual([0, 0]);
      expect(root.children[0].children[1].indices).toEqual([0, 1]);
      expect(root.children[1].indices).toEqual([1]);
    });
  });

  describe(".pathKey", () => {
    it("returns the expected pathKey", () => {
      expect(root.pathKey).toEqual("");
      expect(root.children[0].pathKey).toEqual("1");
      expect(root.children[0].children[0].pathKey).toEqual("2");
      expect(root.children[0].children[1].pathKey).toEqual("1,-1");
      expect(root.children[1].pathKey).toEqual("-1");
    });
  });

  describe(".fetchByPathKey", () => {
    it("returns the expected nodes", () => {
      expect(root.fetchByPathKey("")).toEqual(root);
      expect(root.fetchByPathKey("1")).toEqual(root.children[0]);
      expect(root.fetchByPathKey("2")).toEqual(root.children[0].children[0]);
      expect(root.fetchByPathKey("1,-1")).toEqual(root.children[0].children[1]);
      expect(root.fetchByPathKey("-1")).toEqual(root.children[1]);
      expect(root.fetchByPathKey("-1,1")).toEqual(null);
      expect(root.fetchByPathKey("3")).toEqual(null);
    });
  });

  describe(".fetch", () => {
    it("returns the expected nodes", () => {
      expect(root).toEqual(root);
      expect(root.fetch([0])).toEqual(root.children[0]);
      expect(root.fetch([0, 0])).toEqual(root.children[0].children[0]);
      expect(root.fetch([0, 1])).toEqual(root.children[0].children[1]);
      expect(root.fetch([0, 2])).toEqual(null);
      expect(root.fetch([1])).toEqual(root.children[1]);
      expect(root.fetch([1, 0])).toEqual(null);
      expect(root.fetch([2])).toEqual(null);
    });
  });

  describe(".hasChildren", () => {
    it("returns the expected value", () => {
      expect(root.hasChildren).toEqual(true);
      expect(root.children[1].hasChildren).toEqual(false);
    });
  });

  describe(".add", () => {
    it("adds a new node", () => {
      const node = new TreeNode<string>("1");
      expect(mapModel(node, "breadth")).toEqual(["1"]);
      const child = new TreeNode<string>("11");
      node.add(child);
      expect(mapModel(node, "breadth")).toEqual(["1", "11"]);
      child.add(new TreeNode<string>("111"));
      expect(mapModel(node, "breadth")).toEqual(["1", "11", "111"]);
      node.add(new TreeNode<string>("12"));
      expect(mapModel(node, "breadth")).toEqual(["1", "11", "12", "111"]);
    });
  });

  describe(".drop", () => {
    it("drops a node from the tree", () => {
      const copy = root.clone();
      const node = copy.children[0].children[0].drop();
      expect(mapModel(copy, "breadth")).toEqual(["1", "11", "12", "112"]);
      expect(mapModel(node, "breadth")).toEqual(["111"]);
    });
  });

  describe(".clone", () => {
    it("returns a shallow-copy", () => {
      const clone = root.clone();
      expect(mapModel(root, "breadth")).toEqual(mapModel(clone, "breadth"));
    });
  });

  describe(".path", () => {
    it("returns the correct path", () => {
      expect(
        root.children[0].children[0].path().map((node) => node.model)
      ).toEqual(["1", "11", "111"]);
    });
  });

  describe(".map", () => {
    it("returns a transformed tree", () => {
      const numTree = root.map((node) => parseInt(node.model));
      expect(mapModel(numTree, "breadth")).toEqual([1, 11, 12, 111, 112]);
    });
  });

  describe(".mapAsync", () => {
    it("returns a transformed tree", async () => {
      const numTree = await root.mapAsync(async (node, parent) => {
        return new Promise((resolve) => {
          resolve(node.model + '-' + (parent?.model || 'null'));
        });
      });
      const expected = [
        "1-null",
        "11-1-null",
        "12-1-null",
        "111-11-1-null",
        "112-11-1-null",
      ];
      expect(mapModel(numTree, "breadth")).toEqual(expected);
    });
  });

  describe(".breadth", () => {
    it("traverses correctly", () => {
      expect(mapModel(root, "breadth")).toEqual([
        "1",
        "11",
        "12",
        "111",
        "112",
      ]);
    });
  });

  describe(".pre", () => {
    it("traverses correctly", () => {
      expect(mapModel(root, "pre")).toEqual(["1", "11", "111", "112", "12"]);
    });
  });

  describe(".post", () => {
    it("traverses correctly", () => {
      expect(mapModel(root, "post")).toEqual(["111", "112", "11", "12", "1"]);
    });
  });

  describe(".toObject", () => {
    it("converts a node to an object", () => {
      expect(tree).toEqual(root.toObject());
    });
  });
});
