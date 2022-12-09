export class CommandLog {
  command: string;
  results: string[];

  constructor(command: string, results: string[] = []) {
    this.command = command;
    this.results = [...results];
  }

  append_result(line: string): void {
    this.results.push(line);
  }
}

function parseCommandLogs(input: string): CommandLog[] {
  let lines = input.split("\n");
  let logs: CommandLog[] = [];

  lines.forEach((line: string) => {
    if (!!!line.trim()) {
      return;
    }

    if (line.startsWith("$")) {
      // new command
      logs.push(new CommandLog(line));
    } else {
      // this is a continuation
      let last_command = logs[logs.length - 1];
      last_command.append_result(line);
    }
  });

  return logs;
}

export class TreeNode {
  format(indent: number = 0): string {
    return "";
  }

  recursiveSize(): number {
    throw "NotImplemented";
  }
}

export class FileNode extends TreeNode {
  size: number;

  constructor(size: number) {
    super();
    this.size = size;
  }

  format(indent: number = 0): string {
    return `File(size: ${this.size})`;
  }

  recursiveSize(): number {
    return this.size;
  }
}

export class DirNode extends TreeNode {
  entries: Map<string, TreeNode>;

  constructor(entries?: Map<string, TreeNode>) {
    super();
    this.entries = new Map<string, TreeNode>();
    if (entries !== undefined) {
      for (const [key, value] of entries) {
        this.entries.set(key, value);
      }
    }
  }

  walk(
    callbackfn: (path: string[], dir: DirNode) => void,
    path: string[] = []
  ): void {
    callbackfn(path, this);
    for (const [name, node] of this.entries) {
      if (node instanceof DirNode) {
        node.walk(callbackfn, [...path, name]);
      }
    }
  }

  recursiveSize(): number {
    let acc = 0;
    for (const [name, node] of this.entries) {
      acc += node.recursiveSize();
    }
    return acc;
  }

  ensureDir(path: string[]): DirNode {
    let current: DirNode = this;
    for (const p of path) {
      let child = current.entries.get(p);
      if (child == undefined) {
        child = new DirNode();
        current.entries.set(p, child);
      }

      if (child instanceof DirNode) {
        current = child;
      } else {
        throw `${p} is a file not a directory`;
      }
    }
    return current;
  }

  format(indent: number = 0): string {
    let parts: string[] = ["/"];
    for (const [name, node] of this.entries) {
      parts.push(
        `${"  ".repeat(indent + 1)}${name} ${node.format(indent + 2)}`
      );
    }
    return parts.join("\n");
  }
}

export class PWD {
  path: string[];

  constructor(path: string[] = []) {
    this.path = [...path];
  }

  toString(): string {
    let result = this.path.join("/");
    return "/" + result;
  }

  watch(commandLog: CommandLog): void {
    if (!commandLog.command.startsWith("$ cd")) return;

    const cmd = commandLog.command.split(/\s+/);
    if (cmd.length < 2) {
      console.log("'$ cd' command formatted incorrectly");
      return;
    }
    let arg = cmd[2];
    if (arg == "/") {
      this.path = [];
    } else if (arg == "..") {
      this.path.pop();
    } else {
      this.path.push(arg);
    }
  }
}

export class TreeBuilder {
  root: DirNode;
  pwd: PWD;

  constructor() {
    this.root = new DirNode();
    this.pwd = new PWD();
  }

  watch(cmdLog: CommandLog): void {
    this.pwd.watch(cmdLog);
    let dir = this.root.ensureDir(this.pwd.path);

    // Is ls command:
    if (cmdLog.command.split(/\s+/)[1] == "ls") {
      for (const [name, node] of parseLS(cmdLog.results)) {
        if (!dir.entries.has(name)) {
          dir.entries.set(name, node);
        }
      }
    }
  }
}

export function parseLS(ls: string[]): Map<string, TreeNode> {
  let results: Map<string, TreeNode> = new Map<string, TreeNode>();

  ls.forEach((line) => {
    let words = line.split(/\s+/);
    // is directory
    if (words[0] == "dir") {
      let dirName = words[1];
      results.set(dirName, new DirNode());
    } else {
      // is file
      let fileSize = Number(words[0]);
      let fileName = words[1];
      results.set(fileName, new FileNode(fileSize));
    }
  });
  return results;
}

export function dirSizes(root: DirNode): Map<string[], number> {
  let sizes = new Map<string[], number>();
  root.walk((path: string[], dir: DirNode) => {
    sizes.set(path, dir.recursiveSize());
  });
  return sizes;
}

export function dirsAtMost(dir: DirNode, limit: number = 100000): number {
  let treeSizes = dirSizes(dir);
  let acc = 0;
  treeSizes.forEach((value: number, key: string[]) => {
    if (value <= limit) {
      acc += value;
    }
  });

  return acc;
}

export function main(input: string): number {
  let commandLogs = parseCommandLogs(input);
  let builder = new TreeBuilder();
  commandLogs.forEach((commandLog: CommandLog) => {
    builder.watch(commandLog);
  });

  return dirsAtMost(builder.root);
}

export default {
  CommandLog,
  parseCommandLogs,
};
