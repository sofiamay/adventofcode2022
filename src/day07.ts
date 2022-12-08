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
}

export class DirEntry {
  name: string;
  node: TreeNode;

  constructor(name: string, node: TreeNode) {
    this.name = name;
    this.node = node;
  }

  format(indent: number = 0): string {
    return `${"  ".repeat(indent)}${this.name} ${this.node.format(indent + 1)}`;
  }
}

export class DirNode extends TreeNode {
  entries: DirEntry[];

  constructor(entries: DirEntry[] = []) {
    super();
    this.entries = [...entries];
  }

  format(indent: number = 0): string {
    let parts: string[] = ["/"];
    this.entries.forEach((entry: DirEntry) => {
      parts.push(entry.format(indent + 1));
    });
    return parts.join("\n");
  }
}

export default {
  CommandLog,
  parseCommandLogs,
};
