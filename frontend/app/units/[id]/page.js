import React from "react";

const UnitPage = async ({ params }) => {
  const { id } = await params;
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Unit {id}</h1>
      <p>This will show all patients in this unit</p>
    </div>
  );
};

export default UnitPage;
