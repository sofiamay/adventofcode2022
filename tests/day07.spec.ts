// Problem Statement:
// https://adventofcode.com/2022/day/7
import "mocha";
import { assert, expect } from "chai";

import day07, { CommandLog, FileNode, DirNode, DirEntry } from "../src/day07";

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

describe("DirTree", () => {
  it("FileNode formatting", () => {
    let fn = new FileNode(12);
    assert.equal(fn.format(), "File(size: 12)");
    assert.equal(fn.format(2), "File(size: 12)");
  });

  it("DirNode formatting", () => {
    let tree = new DirNode([
      new DirEntry("foo", new FileNode(12)),
      new DirEntry(
        "bar",
        new DirNode([
          new DirEntry("qux", new FileNode(3)),
          new DirEntry(
            "zzz",
            new DirNode([new DirEntry("jj", new FileNode(42))])
          ),
        ])
      ),
    ]);

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

describe("Day 7", () => {
  it("some basic test", () => {
    assert.equal(2, 2);
  });

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
