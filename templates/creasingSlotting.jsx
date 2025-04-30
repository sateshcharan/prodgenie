// templates/CreasingSlotting.jsx
const CreasingSlotting = ({ materialType, creaseDepth, slotWidth, slotCount }) => {
    const totalSlotLength = slotWidth * slotCount;
  
    return (
      <div style={{ marginTop: 20 }}>
        <h2>Creasing & Slotting Info</h2>
        <p><strong>Material Type:</strong> {materialType}</p>
        <p><strong>Crease Depth:</strong> {creaseDepth} mm</p>
        <p><strong>Slot Width:</strong> {slotWidth} mm</p>
        <p><strong>Number of Slots:</strong> {slotCount}</p>
        <p><strong>Total Slot Length:</strong> {totalSlotLength} mm</p>
      </div>
    );
  };
  
  export default CreasingSlotting;
  