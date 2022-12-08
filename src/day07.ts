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

export class FileNode {
  name: string;
  size: number;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
  }

  format(indent: number = 0): string {
    return `${" ".repeat(indent)}- ${this.name}\t${this.size}`;
  }
}

export class DirNode {
  dirs: DirNode[];
  files: FileNode[];

  constructor(dirs: DirNode[] = [], files: FileNode[] = []) {
    this.dirs = [...dirs];
    this.files = [...files];
  }

  format(indent: number = 0): string {
    let parts: string[] = [];
    this.dirs.forEach((node: DirNode) => {
      parts.push(node.format(indent + 1));
    });
    this.files.forEach((node: FileNode) => {
      parts.push(node.format(indent + 1));
    });
    return parts.join("\n");
  }
}

export default {
  CommandLog,
  parseCommandLogs,
};
