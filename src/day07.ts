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

export default {
  CommandLog,
  parseCommandLogs,
};
