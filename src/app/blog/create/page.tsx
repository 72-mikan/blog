'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

export default function TestPage() {
  const [markdownState, setMarkdownState] = useState('');
  const [publicState, setPublicState] = useState('非公開');

  return (
    <div className="flex border border-black-400">
      <div className="w-183 h-120">
        <form>
          <div className="w-full mb-4 border border-default-medium rounded-base bg-neutral-secondary-medium shadow-xs">
            <div className="px-2 py-1 bg-neutral-secondary-medium rounded-t-base">
              <label htmlFor="comment" className="sr-only">Your comment</label>
              <textarea 
                value={markdownState}
                onChange={(e) => setMarkdownState(e.target.value)}
                id="comment" rows={21} className="block w-full px-0 text-sm text-heading bg-neutral-secondary-medium border-0 focus:ring-0 placeholder:text-body" placeholder="Write a comment..." required ></textarea>
            </div>
            <div className="flex items-center px-3 py-2 border-t border-default-medium">
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Post</button>
              {/* クリップボードコピー */}
              {/* <div className="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
                <button type="button" className="p-2 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-tertiary-medium">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8"/></svg>
                  <span className="sr-only">copy text</span>
                </button>
              </div> */}
              <div className="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
                <label className="relative inline-block w-11 h-6 cursor-pointer">
                  <input type="checkbox" id="hs-basic-usage" className="peer sr-only" onChange={(e) => setPublicState(e.target.checked ? '公開' : '非公開')} />
                  <span className="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 dark:bg-neutral-700 dark:peer-checked:bg-blue-500 peer-disabled:opacity-50 peer-disabled:pointer-events-none"></span>
                  <span className="absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full dark:bg-neutral-400 dark:peer-checked:bg-white"></span>
                </label>
                <span className="select-none ms-3 text-sm font-medium text-heading">{publicState}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="w-197 h-122 overflow-y-auto border border-black-400">
        <div className="prose">
          <Markdown remarkPlugins={[remarkGfm]}>
            {markdownState}
          </Markdown>
        </div>
      </div>
    </div>
  );
}