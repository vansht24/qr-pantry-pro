// Temporary simplified app for debugging
const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Pantry Pal - Inventory Management</h1>
      <p>App is loading successfully!</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => window.location.href = '/restore'}>
          Restore Full App
        </button>
      </div>
    </div>
  );
};

export default App;