import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import "../../css/Report.css";

function ReportPage() {
  const [imei, setImei] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setError("");
      const res = await axios.get(
        "https://gpstrackersystem-production.up.railway.app/api/report",
        {
          params: {
            imei,
            from: fromDate ? fromDate.toISOString() : null,
            to: toDate ? toDate.toISOString() : null,
          },
        }
      );
      setData(res.data);
    } catch (err) {
      setError("Failed to fetch report. Please try again.");
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Report_${imei}_${Date.now()}.xlsx`);
  };

  return (
    <div className="gr-page">
      {/* Header */}
      <header className="gr-header">
        <h1 className="gr-title">Report Generator</h1>
        <p className="gr-subtitle">
          Generate and export GPS tracking reports by IMEI and date range.
        </p>
        <div className="gr-trail"></div>
      </header>

      {/* Filters */}
      <div className="gr-filters">
        <div className="gr-field gr-field--wide">
          <label>IMEI ID</label>
          <input
            type="text"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder="Enter IMEI ID"
          />
        </div>

        <div className="gr-field">
          <label>From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            placeholderText="Select start date"
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
          />
        </div>

        <div className="gr-field">
          <label>To Date</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            placeholderText="Select end date"
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
          />
        </div>

        <button className="gr-btn gr-btn--accent" onClick={fetchReport}>
          Generate Report
        </button>
        <button
          className="gr-btn gr-btn--primary"
          onClick={exportToExcel}
          disabled={!data.length}
        >
          Export to Excel
        </button>
      </div>

      {/* Error */}
      {error && <div className="gr-error">{error}</div>}

      {/* Results */}
      <div className="gr-results">
        {data.length === 0 ? (
          <div className="gr-empty">No data available for this query.</div>
        ) : (
          <>
            <div className="gr-results-bar">
              <div className="gr-count">{data.length} records found</div>
            </div>
            <div className="gr-table-wrap">
              <table className="gr-table">
                <thead>
                  <tr>
                    <th>IMEI</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Speed</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      <td className="gr-mono">{row.imei}</td>
                      <td>{row.latitude}</td>
                      <td>{row.longitude}</td>
                      <td>{row.speed}</td>
                      <td>{new Date(row.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportPage;
