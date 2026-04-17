"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@launchmint/ui";
import { CommentForm } from "./comment-form";
import { deleteOwnCommentAction } from "./actions";

export interface ThreadComment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; avatarUrl: string | null };
  replies: ThreadComment[];
}

export function CommentThread({
  productId,
  comments,
  signedIn,
  viewerId,
}: {
  productId: string;
  comments: ThreadComment[];
  signedIn: boolean;
  viewerId: string | null;
}) {
  return (
    <div className="space-y-6">
      <CommentForm productId={productId} signedIn={signedIn} />
      <ul className="space-y-5">
        {comments.map((c) => (
          <CommentNode
            key={c.id}
            comment={c}
            productId={productId}
            signedIn={signedIn}
            viewerId={viewerId}
            depth={0}
          />
        ))}
      </ul>
    </div>
  );
}

function CommentNode({
  comment,
  productId,
  signedIn,
  viewerId,
  depth,
}: {
  comment: ThreadComment;
  productId: string;
  signedIn: boolean;
  viewerId: string | null;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const initial = comment.author.name?.[0]?.toUpperCase() ?? "?";

  return (
    <li className={depth > 0 ? "ml-6 border-l pl-4" : undefined}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          {comment.author.avatarUrl ? (
            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name ?? ""} />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {comment.author.name ?? "Member"}
            </span>
            <time dateTime={comment.createdAt}>
              {formatRelative(comment.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-line text-sm leading-6">{comment.body}</p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            {depth < 2 ? (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setReplying((v) => !v)}
              >
                {replying ? "Cancel" : "Reply"}
              </button>
            ) : null}
            {viewerId === comment.author.id ? (
              <DeleteCommentButton commentId={comment.id} />
            ) : null}
          </div>
          {replying ? (
            <div className="mt-3">
              <CommentForm
                productId={productId}
                parentId={comment.id}
                signedIn={signedIn}
                placeholder={`Reply to ${comment.author.name ?? "member"}...`}
              />
            </div>
          ) : null}
        </div>
      </div>
      {comment.replies.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {comment.replies.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              productId={productId}
              signedIn={signedIn}
              viewerId={viewerId}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function DeleteCommentButton({ commentId }: { commentId: string }) {
  return (
    <form
      action={async () => {
        await deleteOwnCommentAction(commentId);
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
      >
        Delete
      </Button>
    </form>
  );
}

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  const diffSec = Math.round((Date.now() - ts) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}
