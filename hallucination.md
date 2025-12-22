for this how can we impliment this ?

FR-12: Hallucination Prevention & Source Grounding

FR-12
The system shall prevent AI hallucinations by validating all generated summaries and answers against trusted reference sources provided by the user or approved by the system.

Description

The system shall cross-check all generated content against:

Approved reference books from the college digital library, or

Trusted internet sources only when explicitly requested by the user

If inconsistencies, factual errors, or missing definitions are detected between the generated content and the reference sources:

The system shall automatically correct the content

The system shall clearly highlight all modifications made by the AI

The system shall upload and store the updated version of the corrected document

Question Answering Behavior

When a user asks a question, the system shall:

Identify and highlight relevant keywords and passages in the original source document

Link the answer explicitly to the corresponding source section

Upload and store a highlighted version of the source document to support quick revision

External Source Usage

If the user opts to use internet-based references, the system shall restrict information retrieval to trusted and authoritative sources only, such as:

Wikipedia (for encyclopedic definitions and background information)

Government and international organization websites (e.g., United Nations, national health ministries)

All externally retrieved information shall be clearly labeled as Externally Verified Content.