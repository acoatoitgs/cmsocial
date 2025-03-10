import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

import type { CompileOptions } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import style from "./statement.module.css";
import Submit from "./submit/page";

import "katex/dist/katex.css";
import { getTerryTask } from "~/lib/api/task-terry";

type Props = {
  params: Promise<{ name: string }>;
};

export default async function Page({ params }: Props) {
  const { name } = await params;

  const task = await getTerryTask(name);
  if (!task) notFound();

  const statement = task.statementPath;
  const resp = await fetch(`${process.env.NEXT_PUBLIC_TERRY_URL}/files${statement}`);
  const source = await resp.text();

  const dirname = statement.replace(/\/[^/]*$/, "");

  const mdxOptions: CompileOptions = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  };

  const mapUrl = (url?: string) => {
    return !url || URL.canParse(url) ? url : `/api-terry/files${dirname}/${url}`;
  };

  const a: MDXComponents["a"] = ({ href, ...props }) => {
    return <a href={mapUrl(href)} {...props} />;
  };

  const img: MDXComponents["img"] = ({ src, ...props }) => {
    // biome-ignore lint/a11y/useAltText: alt is provided through props
    return <img src={mapUrl(src)} {...props} />;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div className={style.statement}>
        <MDXRemote options={{ mdxOptions }} components={{ a, img }} source={source} />
      </div>
      <div className="max-lg:hidden">
        <div className="my-6">
          <Submit params={params} />
        </div>
      </div>
    </div>
  );
}
