import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// A4 dimensions in pixels (at 96 DPI, strictly speaking, but for web rendering we often treat it as "pages")
// A4 is 210mm x 297mm.
// We'll use a standard scaling factor.
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// Or we can just use a fixed width for the "virtual page" in the DOM and let jsPDF scale it.
// Let's assume a virtual page width of 794px (approx A4 at 96dpi) to 800px.
const VIRTUAL_PAGE_WIDTH_PX = 800; // Good web width
// Calculate height ratio based on A4 aspect ratio (1.414)
const VIRTUAL_PAGE_HEIGHT_PX = Math.floor((VIRTUAL_PAGE_WIDTH_PX * A4_HEIGHT_MM) / A4_WIDTH_MM);

export async function generatePdf(elementId: string, filename: string = 'document.pdf') {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) {
        throw new Error(`Element with id ${elementId} not found`);
    }

    // 1. Create a temporary container for our "pages"
    // This needs to be hidden from view but rendered so we can capture it.
    // Using 'absolute' and 'top: -9999px' works well.
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-99999px';
    container.style.left = '0';
    container.style.width = `${VIRTUAL_PAGE_WIDTH_PX}px`;
    container.style.backgroundColor = '#ffffff'; // Ensure white background
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    try {
        // 2. Clone the styles to ensure the PDF looks like the preview
        // We already have global styles, but specific container styles might be needed.
        // The components usually have specific classes. We'll rely on global CSS + specific classes.

        // 3. Pagination Logic
        // We will iterate through children of the source and fill "pages"
        const pages: HTMLDivElement[] = [];
        let currentPage = createPage();
        pages.push(currentPage);
        container.appendChild(currentPage);

        const children = Array.from(sourceElement.children);
        let currentPageHeight = 0;

        // We need to account for padding/margins in the rendering
        // Let's safely assume some padding for the page content
        const contentPadding = 40;
        const maxPageHeight = VIRTUAL_PAGE_HEIGHT_PX - (contentPadding * 2);

        for (const child of children) {
            const clonedChild = child.cloneNode(true) as HTMLElement;
            // Reset some styles that might interfere
            clonedChild.style.marginTop = '0';
            clonedChild.style.marginBottom = '1rem'; // normalization

            // We need to temporarily append to measure... but we can't easily measure without rendering.
            // Strategy: Append to current page, measure. If too big, move to next page.
            currentPage.appendChild(clonedChild);

            // Force layout update check? content is already in the DOM (in the off-screen container)
            const childHeight = clonedChild.offsetHeight;

            // Check if this child exceeds the remaining space
            if (currentPageHeight + childHeight > maxPageHeight) {
                // If it fits on a fresh page, move it there
                if (currentPageHeight > 0) {
                    currentPage.removeChild(clonedChild);
                    currentPage = createPage();
                    pages.push(currentPage);
                    container.appendChild(currentPage);

                    // Re-measure on fresh page
                    currentPage.appendChild(clonedChild);

                    // Check if it's STILL too big for a fresh page (Scale to Fit)
                    const onNewPageHeight = clonedChild.offsetHeight;
                    if (onNewPageHeight > maxPageHeight) {
                        const scaleFactor = maxPageHeight / onNewPageHeight;
                        // Apply scaling to fit
                        clonedChild.style.transform = `scale(${scaleFactor})`;
                        clonedChild.style.transformOrigin = 'top left';
                        // Force layout space reservation
                        clonedChild.style.height = `${maxPageHeight}px`;
                        clonedChild.style.width = 'auto';

                        // Update tracking height
                        currentPageHeight = maxPageHeight;
                    } else {
                        currentPageHeight = onNewPageHeight;
                    }
                } else {
                    // It's already on a fresh page but too big. Scale it.
                    const scaleFactor = maxPageHeight / childHeight;
                    clonedChild.style.transform = `scale(${scaleFactor})`;
                    clonedChild.style.transformOrigin = 'top left';
                    clonedChild.style.height = `${maxPageHeight}px`;
                    clonedChild.style.width = 'auto';

                    currentPageHeight += maxPageHeight;
                }
            } else {
                currentPageHeight += childHeight;
            }
        }

        // 4. Generate PDF incrementally
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();

            const page = pages[i];

            // Wait for fonts/images? html-to-image usually handles this, but a small delay can help with complex diagrams
            // Ensure specific elements like mermaid are fully rendered? They should be cloned from the fully rendered source.

            const dataUrl = await toPng(page, {
                quality: 1.0,
                pixelRatio: 2, // Higher density for sharper text/images (simulates retina)
                width: VIRTUAL_PAGE_WIDTH_PX,
                height: VIRTUAL_PAGE_HEIGHT_PX,
                style: {
                    // Ensure no interactions or scrollbars are captured
                    overflow: 'hidden'
                },
                // Filter out any potential interactive elements we don't want?
                filter: () => {
                    return true;
                }
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

            // Clear memory for this page image if possible? 
            // The browser garbage collector handles local vars, but explicit nulling can help for huge docs
        }

        pdf.save(filename);

    } catch (error) {
        console.error('PDF Generation failed:', error);
        throw error;
    } finally {
        // 5. Cleanup
        document.body.removeChild(container);
    }
}

function createPage() {
    const page = document.createElement('div');
    page.style.width = '100%';
    page.style.height = `${VIRTUAL_PAGE_HEIGHT_PX}px`;
    page.style.backgroundColor = 'white';
    page.style.padding = '40px'; // Matching contentPadding
    page.style.boxSizing = 'border-box';
    page.style.overflow = 'hidden'; // Important for clean paging
    page.style.display = 'flex';
    page.style.flexDirection = 'column';

    // Apply prose styles to the page container itself or ensure children carry them
    // The simplest way is to add the prose class if the source had it, but here we are cloning children 
    // that likely expect the prose context.
    // Let's add 'prose' class to the page to ensure child valid styling if they rely on descendant selectors.
    page.className = 'prose prose-lg max-w-none';

    return page;
}
