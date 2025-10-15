export const renderCircularProgressBar = (percentage, isComplete = false) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Define colors for the ring and the glow effect
    const color = isComplete ? '#10B981' : '#38BDF8'; // Green for complete, Sky Blue otherwise
    const trailColor = '#3741514D'; // Dark gray/transparent for the background ring
    const glowColor = isComplete ? '#10B98180' : '#38BDF880';

    return `
        <svg 
            viewBox="0 0 100 100" 
            class="w-32 h-32 transform -rotate-90 transition-transform duration-300 group-hover:scale-[1.02]"
            style="overflow: visible;"
        >
            <!-- Background ring (Transparent) -->
            <circle
                cx="50" cy="50" r="${radius}"
                stroke-width="8"
                stroke="${trailColor}"
                fill="none"
                class="transition-all duration-500"
            />
            
            <!-- Progress ring (Glowing) -->
            <circle
                cx="50" cy="50" r="${radius}"
                stroke-width="8"
                stroke="${color}"
                fill="none"
                stroke-linecap="round"
                stroke-dasharray="${circumference} ${circumference}"
                stroke-dashoffset="${offset}"
                style="
                    transition: stroke-dashoffset 0.5s ease-out, stroke 0.3s ease-out;
                    /* Add glowing filter */
                    filter: drop-shadow(0 0 8px ${glowColor});
                "
            />
            
            <!-- Percentage Text (Rotated back) -->
            <text
                x="50%" y="50%"
                dominant-baseline="middle"
                text-anchor="middle"
                class="fill-white font-header font-extrabold text-xl"
                transform="rotate(90 50 50)"
            >
                ${Math.round(percentage)}%
            </text>
        </svg>
    `;
};