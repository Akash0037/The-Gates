export default function OfflinePage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: '#8b0000',
                fontFamily: 'Cinzel, serif',
                padding: '2rem',
                textAlign: 'center',
            }}
        >
            <h1
                style={{
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    textShadow: '0 0 30px rgba(139, 0, 0, 0.5)',
                }}
            >
                The Gate Is Sealed
            </h1>
            <p
                style={{
                    color: '#666',
                    fontSize: '1rem',
                    letterSpacing: '0.2em',
                    maxWidth: '300px',
                }}
            >
                You have lost connection to the other side. Return when the path reopens.
            </p>
        </div>
    );
}
