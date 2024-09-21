interface CardInfo {
    name: string;
    image_uris: {
        small?: string;
        normal?: string;
    };
    mana_cost: string;
    type_line: string;
    power?: string;
    toughness?: string;
    color_identity: string[];
    keywords?: string[];
    rarity: string;
}

interface CardProps {
    card: CardInfo;
}

const CardComponent: React.FC<CardProps> = ({ card }) => {

    // Extract the small image URI from cardInfo
    const small = card.image_uris.small;

    return (
        <div>
            <h2>{card.name}</h2>
            <img src={small} alt={card.name} style={{ maxWidth: "200px" }} />
        </div>
    );
};

export default CardComponent;
