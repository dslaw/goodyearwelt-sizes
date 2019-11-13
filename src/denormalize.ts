// Get sizing information as a flat array.

import { promises as fs } from "fs";
import * as _ from "lodash";

import { BrannockSize } from "./brannock-size";
import { cleanManufacturerLast, hasValidShoeLast } from "./clean";
import { extractSizing, getSizingPairs, TagSize } from "./extract";
import { Comment, Listing } from "./reddit";


export interface ThreadComments {
  op: Comment;
  comments: Comment[];
}

// A top level comment by the thread author with just a Brannock
// size as the body.
export interface SizeThread {
  id: string;
  brannockSize: BrannockSize;
  replies: Comment[];
}

// Responding sizing information - a fully denormalized
// tagged size, including the Brannock size of the sizing
// thread it belongs to and other ancestor metadata.
export interface SizeRecord extends TagSize {
  id: string;
  mlast: string;
  parentId: string;
  brannockSize: BrannockSize;
  threadId: string;
  threadUrl: string;
}

type PartialSizeRecord = Pick<SizeRecord, "sizingText" | "size" | "width" | "intl" | "mlast">;


export async function readThread(filename: string): Promise<ThreadComments> {
  const contents = await fs.readFile(filename, "utf8");
  const thread = JSON.parse(contents.toString());
  const [ opListing, mainThread ] = thread.map((obj: any) => new Listing(obj));

  if (!opListing.children.length) {
    throw new Error("Original poster listing was not found");
  }
  const [ op ] = opListing.children;
  return { op, comments: mainThread.children };
}

export function getSizingThreads(op: Comment, comments: Comment[]): SizeThread[] {
  const threadAuthor = op.author;

  // Top level comments (with replies) in the thread.
  // Each top level comment should start a subthread per
  // Brannock size.
  const sizingThreads = comments
    .filter((comment) => comment.author === threadAuthor)
    .filter((comment) => comment.replies !== null)
    .map((comment) => {
      const brannockSize = BrannockSize.fromComment(comment);
      const replies = _.get(comment, "replies.children") || [];
      return { id: comment.id, brannockSize, replies };
    });
  return sizingThreads;
}

export function extractSizeRecords(md: string): PartialSizeRecord[] {
  const sizingPairs = getSizingPairs(md);
  const sizeRecords = sizingPairs
    .map(({ shoeLast, sizingText }) => {
      const tagSize = extractSizing(sizingText);
      const mlast = cleanManufacturerLast(shoeLast);
      if (mlast === null || tagSize === null) {
        return null;
      }
      return { ...tagSize, mlast };
    })
    .filter((sizeRecord): sizeRecord is SizeRecord => sizeRecord !== null)
    .filter(({ mlast }) => hasValidShoeLast(mlast));
  return sizeRecords;
}

export function fromSizingThread(sizingThread: SizeThread, threadId: string, threadUrl: string): SizeRecord[] {
  // NB: Only the first level of replies to the size thread are
  //     looked at, as that is how respondents are meant to reply
  const sizeResponses = sizingThread.replies;
  const sizeRecords = _.flatMap(sizeResponses, (sizeResponse) => {
    // Add post metadata for denormalization.
    const addMetadata = (sizeRecord: PartialSizeRecord): SizeRecord => ({
      ...sizeRecord,
      id: sizeResponse.id,
      // NB: Always refers to the size thread id, not the actual
      //     parent comment. In this case, they happen to be the
      //     same as only the first level of replies are looked at.
      parentId: sizingThread.id,
      brannockSize: sizingThread.brannockSize,
      threadId,
      threadUrl,
    });

    if (!sizeResponse.body) {
      return [];
    }

    // Get zero or more lines of sizing information from each reply.
    const responseSizeRecords = extractSizeRecords(sizeResponse.body);
    return responseSizeRecords.map(addMetadata);
  });

  return sizeRecords;
}

export function extract(op: Comment, comments: Comment[]): SizeRecord[] {
  const sizeThreads = getSizingThreads(op, comments);
  const allSizeRecords = _.flatMap(sizeThreads,
    (sizeThread) => fromSizingThread(sizeThread, op.id, op.url));
  return allSizeRecords;
}
