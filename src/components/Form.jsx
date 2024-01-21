// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"
/* eslint-disable */
import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { useNavigate } from "react-router-dom";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../contexts/CitiesContext";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
const ACCESS_TOKEN = "pk.9f01724a72894257b7c0e709a6604031";
const BASE_URL = " https://us1.locationiq.com/v1/reverse";
function Form() {
  /* eslint-disable */
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  const [lat, lng] = useUrlPosition();
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");
  const { createCity, isLoading } = useCities();

  useEffect(
    function () {
      if (!lat && !lng) return;
      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true);
          setGeocodingError("");
          const res = await fetch(
            `${BASE_URL}?key=${ACCESS_TOKEN}&lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          console.log(data);
          if (data.error)
            throw new Error(
              "That doesnt seem to be a city. Click somewhere else😉"
            );

          setCityName(
            data.address.city ||
              data.address.village ||
              data.address.town ||
              data.address.district ||
              data.address.region ||
              data.address.state ||
              data.address.country ||
              ""
          );
          setCountry(data.address.country);
          setEmoji(
            `https://flagsapi.com/${data.address.country_code.toUpperCase()}/flat/32.png`
          );
        } catch (error) {
          setGeocodingError(String(error));
        } finally {
          setIsLoadingGeocoding(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );
  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    await createCity(newCity);
    navigate("/app/cities");
  }

  if (isLoadingGeocoding) return <Spinner />;
  if (!lat && !lng)
    return <Message message={"Start by clicking somewhere in the map"} />;
  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <img className={styles.flag} src={emoji} />
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <ReactDatePicker
          onChange={(date) => setDate(date)}
          selected={date}
          id="date"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
