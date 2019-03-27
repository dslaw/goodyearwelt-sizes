export class Listing {
  public children: Comment[];
  public kind: string;
  public modhash: string;

  constructor(obj: any) {
    if (obj.kind !== "Listing") {
      throw new Error(`Expected "Listing", got ${obj.kind} instead`);
    }

    this.children = obj.data.children.map((child: any) => new Comment(child));
    this.kind = obj.kind;
    this.modhash = obj.data.modhash;
  }
}

export class Comment {
  public replies: Listing | null;
  public author: string;
  public body: string | null;
  public createdUtc: number;
  public id: string;
  public kind: string;
  public parentId: string | null;
  public subreddit: string;
  public url: string;

  constructor(obj: any) {
    if (obj.kind !== "t1" && obj.kind !== "t3") {
      throw new Error(`Expected "t1" or "t3", got ${obj.kind} instead`);
    }

    if (obj.data.replies) {
      this.replies = new Listing(obj.data.replies);
    } else {
      this.replies = null;
    }

    this.author = obj.data.author;
    // t3 posts use `selftext`, while t3 uses `body` for
    // markdown and `body_html` for html.
    this.body = obj.data.selftext || obj.data.body || null;
    this.createdUtc = obj.data.created_utc;
    this.id = obj.data.id;
    this.kind = obj.kind;
    this.parentId = obj.data.parent_id || null;
    this.subreddit = obj.data.subreddit;
    this.url = obj.data.url;
  }
}
