let nextPageUrl = 'https://api.scryfall.com/cards/search?q=type:legendary';
let legendaryCards = [];

async function fetchLegendaryCards() {
    legendaryCards = []; // Reset the array
    nextPageUrl = 'https://api.scryfall.com/cards/search?q=type:legendary'; // Reset URL

    try {
        do {
            const response = await fetch(nextPageUrl);
            if (!response.ok) {
                throw new Error(`Error fetching cards: ${response.statusText}`);
            }
            const data = await response.json();

            // Filter for legendary creatures and legendary Planeswalkers
            const filteredCards = data.data.filter(card => {
                return (
                    card.type_line.includes('Legendary Creature') || 
                    (card.type_line.includes('Legendary Planeswalker') && 
                     card.oracle_text && 
                     card.oracle_text.includes('Commander'))
                );
            });

            legendaryCards.push(...filteredCards); // Add filtered cards

            nextPageUrl = data.has_more ? data.next_page : null; // Update URL for next page
        } while (nextPageUrl);

        return legendaryCards; // Return the fetched legendary cards
    } catch (error) {
        console.error("Error fetching legendary cards:", error);
        return []; // Return empty array on error
    }
}

async function generateLegendaryCard() {
    const cards = await fetchLegendaryCards();
    if (cards.length > 0) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        const randomCard = cards[randomIndex];
        displayCard(randomCard);
    } else {
        document.getElementById('creature').innerHTML = "Could not fetch legendary cards.";
        document.getElementById('decks').innerHTML = "";
    }
}

function displayCard(card) {
    const cardDiv = document.getElementById('creature');
    let imageUrl = 'https://via.placeholder.com/150'; // Fallback image

    // Check if the card has multiple faces
    if (card.card_faces) {
        imageUrl = card.card_faces[0].image_uris?.normal || imageUrl; // Use first face image
    } else {
        imageUrl = card.image_uris?.normal || imageUrl; // Fallback to normal image
    }

    cardDiv.innerHTML = `
        <h2>${card.name}</h2>
        <img src="${imageUrl}" alt="${card.name}">
        <p>${card.oracle_text || 'No description available.'}</p>
    `;
}

// Add event listener to the button to generate a legendary card on click
document.getElementById('generate-btn').addEventListener('click', generateLegendaryCard);
