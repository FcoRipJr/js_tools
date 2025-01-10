self.onmessage = function (e) {
    const { imgData, width, height, step, tolerance, ignoreColorStart, ignoreColorEnd, maxColors, threshold } = e.data;

    const matrix = {};
    
    function rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    function approximateColor(r, g, b, tolerance) {
        r = Math.round(r / tolerance) * tolerance;
        g = Math.round(g / tolerance) * tolerance;
        b = Math.round(b / tolerance) * tolerance;
        return rgbToHex(
            Math.min(255, Math.max(0, r)),
            Math.min(255, Math.max(0, g)),
            Math.min(255, Math.max(0, b))
        );
    }

    function isColorInRange(color, startColor, endColor) {
        const colorInt = parseInt(color.slice(1), 16);
        const startInt = parseInt(startColor.slice(1), 16);
        const endInt = parseInt(endColor.slice(1), 16);
        return colorInt >= startInt && colorInt <= endInt;
    }

    function colorDistance(c1, c2) {
        const r1 = parseInt(c1.slice(1, 3), 16);
        const g1 = parseInt(c1.slice(3, 5), 16);
        const b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16);
        const g2 = parseInt(c2.slice(3, 5), 16);
        const b2 = parseInt(c2.slice(5, 7), 16);

        return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    }

    function groupColors(matrix, maxColors, threshold = 40) {
        const groups = [];

        Object.keys(matrix).forEach(hexColor => {
            let grouped = false;

            for (let group of groups) {
                if (colorDistance(hexColor, group.color) < threshold) {
                    group.colors.push(hexColor);
                    group.pixels.push(...matrix[hexColor].pixels);
                    group.colors.push(hexColor);
                    grouped = true;
                    break;
                }
            }

            if (!grouped) {
                groups.push({ color: hexColor, colors: [hexColor],pixels: [...matrix[hexColor].pixels] });
            }
        });

        if (maxColors > 0 && groups.length > maxColors) {
            groups.sort((a, b) => b.colors.length - a.colors.length);

            while (groups.length > maxColors) {
                const lastGroup = groups.pop();
                let closestGroup = null;
                let closestDistance = Infinity;

                groups.forEach(group => {
                    const distance = colorDistance(lastGroup.color, group.color);
                    if (distance < closestDistance) {
                        closestGroup = group;
                        closestDistance = distance;
                    }
                });

                if (closestGroup) {
                    closestGroup.colors.push(...lastGroup.colors);
                    closestGroup.pixels.push(...lastGroup.pixels);
                }
            }
        }

        const groupedMatrix = {};
        groups.forEach(group => {
            const groupedColor = group.color;
            groupedMatrix[groupedColor] = {
                hexColor: groupedColor,
                NewColor: groupedColor,
                pixels: group.pixels
            };
        });

        return groupedMatrix;
    }

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const i = (y * width + x) * 4;
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const hexColor = approximateColor(r, g, b, tolerance);

            if (isColorInRange(hexColor, ignoreColorStart, ignoreColorEnd)) continue;

            if (!matrix[hexColor]) {
                matrix[hexColor] = {
                    hexColor: hexColor,
                    NewColor: hexColor,
                    pixels: []
                };
            }
            matrix[hexColor].pixels.push({ x: x / step, y: y / step });
        }
    }
    if (maxColors > 0) {
        const finalMatrix = groupColors(matrix, maxColors, threshold);
        self.postMessage(finalMatrix);
    } else{
        self.postMessage(matrix);
    }
};