# Source Validation & Fact-Checking System

## Overview

The Dynamic Source Validation System allows users to **search for authoritative sources**, **select trusted references**, and **validate content** against them to prevent AI hallucinations and ensure factual accuracy.

## Features

### 1. **Dynamic Web Source Search**
- Search for authoritative sources based on topic and query
- AI automatically finds 5-8 relevant sources from:
  - Educational institutions (.edu)
  - Government websites (.gov)
  - International organizations (WHO, UN, UNESCO)
  - Academic journals and databases
  - Wikipedia for general knowledge
  - Reputable scientific institutions

### 2. **User-Controlled Source Selection**
- Review search results with detailed information:
  - Source title and description
  - Domain and URL
  - Reliability rating (high/medium/low)
  - Source type (academic/government/encyclopedia/news)
  - Trusted domain indicator
- **Select which sources to use** for validation
- Bulk actions: Select All, Clear All
- Visual indicators for selected and trusted sources

### 3. **Content Validation**
- Cross-checks content against selected sources
- Automatically fetches and analyzes reference materials
- Identifies:
  - ✓ **Verified facts** - confirmed by references
  - ✓ **Corrected information** - fact-checked and fixed
  - ⚠️ **Needs verification** - requires additional checking
  - ℹ️ **Not in reference** - not found in selected sources

### 4. **Validation Results**
Three tabs for comprehensive results:
1. **Validated Content** - Full content with inline validation markers
2. **Corrections** - List of all corrections with:
   - Original text
   - Corrected version
   - Source citation
3. **Sources Used** - Full list of references with links

### 5. **Actions**
- Copy validated content to clipboard
- Save validated content as a new document
- Start new validation with different sources

## How to Use

### Step 1: Open Source Validation
Click the **Shield Check** icon in the header (🛡️) to open the Source Validation modal.

### Step 2: Search for Sources
1. Enter your **Topic/Subject** (e.g., "Climate Change", "Human Biology")
2. Enter a **Specific Query** (e.g., "greenhouse gas emissions", "cardiovascular system")
3. Click **Search Sources**

The AI will search for 5-8 authoritative sources related to your topic.

### Step 3: Select Sources
1. Review the search results
2. Click on source cards to **select/deselect** them
3. Use **Select All** or **Clear All** for bulk operations
4. Trusted sources are highlighted with a green badge 🛡️

### Step 4: Validate Content
1. Once you've selected sources, click **Validate Content Against Selected Sources**
2. The system will:
   - Fetch content from each selected source
   - Cross-check your content against references
   - Identify discrepancies and corrections
   - Generate a validated version

### Step 5: Review Results
- Switch between tabs to see:
  - **Validated Content**: Your content with inline markers
  - **Corrections**: What was changed and why
  - **Sources Used**: All reference sources

### Step 6: Save or Copy
- **Copy Validated Content**: Copy to clipboard (clean text)
- **Save as New Document**: Add to your knowledge base
- **New Validation**: Start over with different sources

## Validation Markers

| Marker | Meaning |
|--------|---------|
| `[✓ VERIFIED \| Source: name]` | Fact confirmed by reference source |
| `[✓ CORRECTED: "original" → "corrected" \| Source: name]` | Fact-checked and corrected |
| `[⚠️ NEEDS VERIFICATION: reason]` | Requires additional checking |
| `[ℹ️ NOT IN REFERENCE]` | Information not found in selected sources |

## Example Workflow

### Scenario: Validating a Biology Summary

1. **Topic**: "Human Cardiovascular System"
2. **Query**: "heart function and blood circulation"
3. **Sources Found**:
   - Wikipedia - Circulatory System (trusted)
   - NIH - Heart Function (trusted, high reliability)
   - Medical textbook database (high reliability)
   - Health organization website (medium reliability)

4. **Select**: NIH and Wikipedia
5. **Validate**: System cross-checks your summary
6. **Results**:
   - 8 verified facts
   - 2 corrections (outdated information updated)
   - 1 needs verification (specific measurement)
   - All corrections clearly marked with sources

## Use Cases

### 1. **Academic Research**
- Validate study notes against authoritative sources
- Ensure citations and facts are accurate
- Ground AI-generated summaries in trusted references

### 2. **Content Creation**
- Fact-check articles before publishing
- Verify statistical claims
- Ensure accuracy of educational content

### 3. **Learning & Study**
- Cross-check study materials with official sources
- Identify gaps in knowledge
- Validate understanding against textbooks

### 4. **Professional Writing**
- Verify business reports against industry sources
- Check technical documentation accuracy
- Ensure compliance with official guidelines

## Technical Details

### Trusted Domains (Pre-configured)
- `wikipedia.org` - Encyclopedic knowledge
- `who.int` - World Health Organization
- `cdc.gov` - Centers for Disease Control
- `un.org` - United Nations
- `nih.gov` - National Institutes of Health
- `nature.com` - Scientific journals
- `sciencedirect.com` - Academic research
- `ncbi.nlm.nih.gov` - Medical research
- `.edu` domains - Educational institutions

### AI Search Process
1. **Query Understanding**: AI analyzes topic and query
2. **Source Discovery**: Searches for relevant authoritative sources
3. **Reliability Assessment**: Evaluates source credibility
4. **Results Structuring**: Returns organized list with metadata

### Validation Process
1. **Content Fetching**: Retrieves information from selected sources
2. **Cross-Referencing**: Compares content against references
3. **Discrepancy Detection**: Identifies factual errors or inconsistencies
4. **Correction Generation**: Suggests fixes with source citations
5. **Markup Creation**: Adds inline validation markers

## Best Practices

### ✅ Do:
- Select multiple sources for comprehensive validation
- Prioritize trusted domains (marked with 🛡️)
- Review all corrections before accepting
- Use specific queries for better source matching
- Save validated content for future reference

### ❌ Don't:
- Rely on a single source for validation
- Skip reviewing the corrections tab
- Ignore "needs verification" warnings
- Use overly broad queries (e.g., "science")
- Trust unmarked sources without verification

## Privacy & Security
- All validation happens through the Gemini API
- No data is stored on external servers
- Source URLs are public and accessible
- Validated content stays on your device

## Future Enhancements
- [ ] Custom source library management
- [ ] Automatic source ranking based on citations
- [ ] Export validated content with full citations
- [ ] Batch validation for multiple documents
- [ ] Source credibility scoring system
- [ ] Integration with reference managers (Zotero, Mendeley)

## Troubleshooting

**Sources not found?**
- Try a more specific query
- Use alternative keywords
- Check your internet connection

**Validation taking too long?**
- Reduce number of selected sources
- Use shorter content for validation
- Check API rate limits

**Corrections seem incorrect?**
- Review the source citations
- Manually verify the original sources
- Report issues with specific sources

## Support
For issues or questions about source validation, please refer to the main [REQUIREMENTS.md](REQUIREMENTS.md) document or open an issue in the repository.
