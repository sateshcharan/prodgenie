// templates/TitleBlock.jsx
const TitleBlock = ({ jobTitle, jobNumber }) => (
    <div style={{ borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
      <h1>{jobTitle}</h1>
      <p>Job Number: {jobNumber}</p>
    </div>
  );
  
  export default TitleBlock;
  