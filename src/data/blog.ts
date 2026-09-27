export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  /** Simple paragraphs and headings; strings starting with "## " render as sub-headings. */
  content: string[];
  seo: { title: string; description: string };
  /** Optional CMS-managed fields */
  image?: { src: string; alt: string };
  author?: string;
  publishedAt?: string;
  tags?: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-accurate-bookkeeping-matters-for-small-businesses",
    title: "Why Accurate Bookkeeping Matters for Small Businesses",
    excerpt:
      "Bookkeeping is often treated as an afterthought, yet it quietly shapes almost every decision a business owner makes. Here is why it deserves attention from day one.",
    category: "Accounting",
    readTime: "4 min read",
    content: [
      "For many small business owners, bookkeeping is the task that always slides to the bottom of the list. Sales, customers and daily operations feel more urgent. Yet the businesses that run most smoothly tend to be those that keep their records accurate and current.",
      "## Clarity over cash",
      "Accurate records tell you what is actually happening with money in the business: what has been earned, what has been spent, what is owed and what is due. Without this picture, decisions are made on feel rather than fact.",
      "## Fewer surprises",
      "When transactions are recorded consistently, month-end and year-end become routine rather than stressful. Missing documents, unexplained balances and last-minute reconstruction of records become far less common.",
      "## Better conversations",
      "Whether you are speaking with a partner, a lender or an adviser, organized financial records make every conversation more productive. You can answer questions confidently and focus on the future instead of reconstructing the past.",
      "## Where to begin",
      "Start with simple, consistent habits: separate business and personal transactions, keep supporting documents for every entry, and record transactions regularly rather than in bulk. If time or expertise is a constraint, professional bookkeeping support can put a reliable routine in place.",
    ],
    seo: {
      title: "Why Accurate Bookkeeping Matters for Small Businesses | TV Clarity Capital",
      description:
        "Accurate bookkeeping gives small businesses clarity over cash, fewer surprises and better decisions. Practical insights from TV Clarity Capital, Monaragala.",
    },
  },
  {
    slug: "preparing-to-register-your-business-a-practical-checklist",
    title: "Preparing to Register Your Business: A Practical Checklist",
    excerpt:
      "Registering a business is an important milestone. A little preparation beforehand makes the process smoother and helps you start on a solid foundation.",
    category: "Business Registration",
    readTime: "5 min read",
    content: [
      "Formalizing a business is a significant step. While requirements vary depending on the type and structure of business, some preparation is helpful in almost every case.",
      "## Decide on the business structure",
      "Think carefully about how you want to operate: alone, with partners, or as a company. Each structure has different implications for responsibility, record-keeping and future growth. Discussing this with a professional early can prevent changes later.",
      "## Settle the essentials",
      "Have a clear business name in mind, along with alternatives, a description of your business activities and the details of the people involved. Having these ready avoids delays when forms need to be completed.",
      "## Organize your documents",
      "Gather identification documents and any other paperwork typically required for your chosen structure. Keeping copies organized in one place, physical or digital, saves time throughout the process.",
      "## Plan what comes after registration",
      "Registration is a beginning, not an end. Plan how you will maintain records, manage banking and handle accounting from the first day of operation. Setting up simple systems early makes everything easier as the business grows.",
      "## Get guidance where it helps",
      "If any step is unclear, guidance from someone familiar with the process can make it far less stressful. TV Clarity Capital provides business registration guidance and documentation support for new and growing businesses.",
    ],
    seo: {
      title: "Preparing to Register Your Business: A Practical Checklist | TV Clarity Capital",
      description:
        "A practical checklist for entrepreneurs preparing to register a business: structure, essentials, documents and post-registration planning. From TV Clarity Capital, Monaragala.",
    },
  },
  {
    slug: "signs-your-business-is-ready-for-digital-tools",
    title: "Signs Your Business Is Ready for Digital Tools",
    excerpt:
      "Technology should simplify a business, not complicate it. These practical signs suggest it may be time to move from manual processes to digital solutions.",
    category: "IT Solutions",
    readTime: "4 min read",
    content: [
      "Not every business needs complex software. But there is usually a point where manual processes begin to cost more time, money and accuracy than a suitable digital tool would.",
      "## The same information is written down more than once",
      "If sales are recorded in a book, then copied to a spreadsheet, then summarized again for accounts, a simple system could capture the information once and produce everything else automatically.",
      "## Customers struggle to find or reach you",
      "A clear, mobile-friendly website with your services, location and contact details is often the most cost-effective improvement a business can make to its visibility.",
      "## Stock, sales or payments are hard to track",
      "When it becomes difficult to know what is in stock, what has been sold or who still owes money, a point-of-sale or basic business system brings order quickly.",
      "## Reports take days to prepare",
      "If producing a simple summary of performance requires hours of manual work, the data is probably scattered. Connected systems make reporting a by-product of daily operations rather than a separate project.",
      "## Start small and practical",
      "The most successful digital improvements start with one clear problem and a solution sized to the business. An independent IT consultation can help you decide where to begin.",
    ],
    seo: {
      title: "Signs Your Business Is Ready for Digital Tools | TV Clarity Capital",
      description:
        "Practical signs it is time to move from manual processes to digital tools: duplicated data, hard-to-track stock and slow reporting. Insights from TV Clarity Capital IT Solutions.",
    },
  },
  {
    slug: "how-to-get-more-value-from-a-business-consultation",
    title: "How to Get More Value From a Business Consultation",
    excerpt:
      "A consultation is most useful when both sides come prepared. Here is how to make the most of the time and turn a conversation into practical progress.",
    category: "Business Consulting",
    readTime: "3 min read",
    content: [
      "A good business consultation should leave you with clearer thinking and practical next steps. A little preparation on your side makes that outcome much more likely.",
      "## Be clear about the question",
      "Try to describe the problem or goal in one or two sentences before the meeting. Even if the real issue turns out to be different, a clear starting point focuses the conversation.",
      "## Bring the relevant facts",
      "Recent figures, a description of how things currently work and any documents connected to the issue help the discussion move from general advice to specific recommendations.",
      "## Be open about constraints",
      "Budget, time, people and skills all shape what is realistic. Sharing these openly leads to recommendations you can actually implement.",
      "## Agree on next steps",
      "Before the conversation ends, agree on what happens next, who is responsible and when progress will be reviewed. This turns advice into action.",
    ],
    seo: {
      title: "How to Get More Value From a Business Consultation | TV Clarity Capital",
      description:
        "Simple ways to prepare for a business consultation and turn it into practical progress. Insights from TV Clarity Capital business consulting, Monaragala.",
    },
  },
];

export const getPostBySlug = (slug: string | undefined) =>
  blogPosts.find((post) => post.slug === slug);
