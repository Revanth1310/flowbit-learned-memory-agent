declare module "better-sqlite3" {
  interface DatabaseOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (...args: any[]) => void;
  }

  interface Statement {
    run(...params: any[]): any;
    get(...params: any[]): any;
    all(...params: any[]): any;
  }

  class Database {
    constructor(filename: string, options?: DatabaseOptions);

    prepare(sql: string): Statement;
    pragma(sql: string): any;
    close(): void;
  }

  export = Database;
}
