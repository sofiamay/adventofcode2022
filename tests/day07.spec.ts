// Problem Statement:
// https://adventofcode.com/2022/day/7
import "mocha";
import { assert, expect } from "chai";

import day07, {
  CommandLog,
  FileNode,
  DirNode,
  TreeNode,
  PWD,
  parseLS,
  TreeBuilder,
} from "../src/day07";

const exampleInput = `
$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k
`;

describe("Command Parser", () => {
  it("chunk input", () => {
    expect(day07.parseCommandLogs(exampleInput)).to.eql([
      new CommandLog("$ cd /"),
      new CommandLog("$ ls", [
        "dir a",
        "14848514 b.txt",
        "8504156 c.dat",
        "dir d",
      ]),
      new CommandLog("$ cd a"),
      new CommandLog("$ ls", ["dir e", "29116 f", "2557 g", "62596 h.lst"]),
      new CommandLog("$ cd e"),
      new CommandLog("$ ls", ["584 i"]),
      new CommandLog("$ cd .."),
      new CommandLog("$ cd .."),
      new CommandLog("$ cd d"),
      new CommandLog("$ ls", [
        "4060174 j",
        "8033020 d.log",
        "5626152 d.ext",
        "7214296 k",
      ]),
    ]);
  });
});

describe("parseLS", () => {
  it("parses lines of text into dirs and files", () => {
    const ls = ["dir a", "14848514 b.txt", "8504156 c.dat"];

    expect(parseLS(ls)).to.eql(
      new Map<string, TreeNode>([
        ["a", new DirNode()],
        ["b.txt", new FileNode(14848514)],
        ["c.dat", new FileNode(8504156)],
      ])
    );
  });
});

describe("PWD", () => {
  it("constructor", () => {
    let pwd = new PWD();
    expect(pwd.path).to.eql([]);
  });
  it("state transition", () => {
    let pwd = new PWD();
    pwd.watch(new CommandLog("$ cd /"));
    expect(pwd.path).to.eql([]);

    pwd.watch(new CommandLog("$ cd foo"));
    pwd.watch(new CommandLog("$ cd bar"));
    expect(pwd.path).to.eql(["foo", "bar"]);

    pwd.watch(new CommandLog("$ cd .."));
    expect(pwd.path).to.eql(["foo"]);

    pwd.watch(new CommandLog("$ ls"));
    expect(pwd.path).to.eql(["foo"]);

    pwd.watch(new CommandLog("$ cd /"));
    expect(pwd.path).to.eql([]);

    pwd.watch(new CommandLog("$ cd .."));
    expect(pwd.path).to.eql([]);
  });
});

describe("DirTree", () => {
  it("FileNode formatting", () => {
    let fn = new FileNode(12);
    assert.equal(fn.format(), "File(size: 12)");
    assert.equal(fn.format(2), "File(size: 12)");
  });

  it("DirNode formatting", () => {
    let tree = new DirNode(
      new Map<string, TreeNode>([
        ["foo", new FileNode(12)],
        [
          "bar",
          new DirNode(
            new Map<string, TreeNode>([
              ["qux", new FileNode(3)],
              [
                "zzz",
                new DirNode(
                  new Map<string, TreeNode>([["jj", new FileNode(42)]])
                ),
              ],
            ])
          ),
        ],
      ])
    );

    expect(tree.format()).to.equal(
      [
        "/",
        "  foo File(size: 12)",
        "  bar /",
        "      qux File(size: 3)",
        "      zzz /",
        "          jj File(size: 42)",
      ].join("\n")
    );
  });
});

describe("TreeBuilder", () => {
  it("DirNode formatting", () => {
    let commandLogs = day07.parseCommandLogs(exampleInput);
    let tree_builder = new TreeBuilder();
    commandLogs.forEach((commandLog: CommandLog) => {
      tree_builder.watch(commandLog);
    });

    let tree = tree_builder.root;
    expect(tree.format()).to.equal(
      [
        "/",
        "  a /",
        "      e /",
        "          i File(size: 584)",
        "      f File(size: 29116)",
        "      g File(size: 2557)",
        "      h.lst File(size: 62596)",
        "  b.txt File(size: 14848514)",
        "  c.dat File(size: 8504156)",
        "  d /",
        "      j File(size: 4060174)",
        "      d.log File(size: 8033020)",
        "      d.ext File(size: 5626152)",
        "      k File(size: 7214296)",
      ].join("\n")
    );
  });
});
