import React from "react";
import Planner from '@/Mainpages/PlanATripComponents/SchedulesPlan'; // Ensure this path is correct

const SidePanel = ({tripName, tripDate, firstDestination, itinerary, setItinerary, onItineraryChange}) => {
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
        <p><strong>First Destination:</strong> {firstDestination || "Your first selected destination will display here"}</p>
        <p>
            <strong>Trip Date:</strong>{" "}
            {startDate && endDate
            ? `${startDate} - ${endDate}`
            : "Your selected dates will display here"}
        </p>
        

        <Planner
            startDate={tripDate?.start}
            endDate={tripDate?.end}
            itinerary={itinerary}
            setItinerary={setItinerary}
            onItineraryChange={onItineraryChange}
        />


        {/* Travel Time Total */}
        <p className="text-sm font-semibold mt-4">Travel Time Total: 3hrs 22mins</p>
        </div>
    );
};

export default SidePanel;
