import React from "react";

const SidePanel = ({tripName, tripDate, firstDestination, itenerary}) => {
    const formatTripDate = (date) => {
        if (date && date.calendar) {
          const { day, month, year } = date;
          return `${month}/${day}/${year}`;
        }
        return null; 
      };

    const startDate = tripDate?.start ? formatTripDate(tripDate.start) : null;
    const endDate = tripDate?.end ? formatTripDate(tripDate.end) : null;

    console.log(tripDate); 
    return (
        <div className="bg-white shadow-lg rounded-lg p-5 overflow-y-auto max-h-[800px]">
        <h2 className="text-lg font-semibold">Trip Details Overview</h2>
        <p><strong>Trip Name:</strong> {tripName || "Your trip name will display here"}</p>
        <p>
            <strong>Trip Date:</strong>{" "}
            {startDate && endDate
            ? `${startDate} - ${endDate}`
            : "Your selected dates will display here"}
        </p>
        <p><strong>First Destination:</strong> {firstDestination || "Your first selected destination will display here"}</p>

        {/* Stops List */}
        <div className="mt-4">
            <div className="relative border-l-4 border-gray-300 pl-4">
            {itenerary && (
                <>
                {itenerary.map((stop, index) => (
                <div key={index} className="mb-5 relative">
                {/* Numbered Circle */}
                <span className="absolute -left-7 top-1 bg-gray-800 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                    {index+1}
                </span>

                {/* <p className="text-sm font-semibold">{stop.text}</p> */}
                <p className="text-sm font-semibold">nth stop - nkm away | nmin</p>

                {/* Business Card */}
                <div className="mt-2 bg-white shadow-md rounded-lg border p-3 flex items-center gap-3">
                    <img
                    src="https://via.placeholder.com/80"
                    alt="Business"
                    className="w-20 h-14 object-cover rounded-md"
                    />
                    <div>
                    <h3 className="text-sm font-semibold">Business Name</h3>
                    <p className="text-xs text-gray-500">Location | Business Category</p>
                    <p className="text-yellow-500 text-sm">★★★★☆ 4.5</p>
                    </div>
                </div>
                </div>
            ))}
                </>
            )}
            </div>
        </div>

        {/* Travel Time Total */}
        <p className="text-sm font-semibold mt-4">Travel Time Total: 3hrs 22mins</p>
        </div>
    );
};

export default SidePanel;
