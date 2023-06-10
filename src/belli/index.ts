import * as fs from "node:fs";
import vm from "node:vm";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import handlebars from "handlebars";
import { parse } from "./parser";

interface Options {
    script: string;
    template: string;
    env: boolean;
    _: string[];
}

interface Context {
    data: { [key: string]: any };
    env: any;
    def: (name: string, value: any) => void;
}

const option: Options = yargs(hideBin(process.argv))
    .command("compile [template]", "compiles a template", (yargs) => {
        return yargs
            .positional("template", {
                describe: "path to template file",
                type: "string"
            })
    })
    .option("env", {
        describe: "include environment variables in the scope for the template",
        type: 'boolean'
    })
    .strictCommands()
    .demandCommand(1)
    .parseSync() as any as Options;


if (option._[0] === "compile") {
    const filename = option.template;
    const templateString = fs.readFileSync(filename, { encoding: "utf-8" });
    
    const { script, template } = parse(templateString);

    const data: Context['data'] = {};
    const env = option.env ? { ...process.env} : {};
    const def = (name: string, value: any) => data[name] = value;

    const ctx: Context = { data, env, def };
    vm.runInNewContext(script, ctx);
    data['env'] = { 
        ...(env), 
        ...('env' in data ? data['env'] : {} as any)
    };

    const fn = handlebars.compile(template);
    const output = fn(ctx.data);

    console.log(output);
}