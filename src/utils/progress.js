// Function to render the Circular Progress Bar as an SVG string
// This is done this way to directly reuse the original logic and styles via dangerouslySetInnerHTML.
export function renderCircularProgressBar(progress, size = 80, strokeWidth = 8) {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    // progress is clamped between 0 and 100 for safety
    const safeProgress = Math.max(0, Math.min(100, progress)); 
    const offset = circumference - (safeProgress / 100) * circumference;

    return `
        <div class="relative" style="width:${size}px;height:${size}px">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 ${size} ${size}">
                <circle 
                    class="text-gray-200/10" 
                    stroke="currentColor" 
                    stroke-width="${strokeWidth}" 
                    fill="transparent" 
                    r="${radius}" 
                    cx="${center}" 
                    cy="${center}"
                />
                <circle 
                    class="text-sky-400 progress-glow glow-sky" 
                    stroke="currentColor" 
                    stroke-width="${strokeWidth}" 
                    stroke-linecap="round" 
                    fill="transparent" 
                    r="${radius}" 
                    cx="${center}" 
                    cy="${center}" 
                    stroke-dasharray="${circumference}" 
                    style="transition:stroke-dashoffset .5s ease-out;stroke-dashoffset:${offset}"
                />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-medium text-gray-200">${Math.round(safeProgress)}%</span>
            </div>
        </div>
    `;
}