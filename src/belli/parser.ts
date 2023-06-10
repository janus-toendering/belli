import { Exception } from "handlebars";

const regex = /^\s*<script>\s*(?<script>.*?)\s*<\/script>\s*(?<template>.*$)/msg;

export function parse(templateString: string)
{
    // simple parser for now
    const match = regex.exec(templateString);
    if (match === null)
        throw new Exception("Could not parse tempalte file.");

    const  { script, template } = match.groups as { script: string, template: string};
    return { script, template };
}
