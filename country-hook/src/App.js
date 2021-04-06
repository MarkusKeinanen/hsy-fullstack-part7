import React, { useState, useEffect } from 'react'
import axios from 'axios'

const useField = (type) => {
	const [value, setValue] = useState('')

	const onChange = (event) => {
		setValue(event.target.value)
	}

	return {
		type,
		value,
		onChange
	}
}

export const useCountry = (name) => {
	const [data, setData] = useState(null)
	useEffect(() => {
		if (name == null) return null
		const fn = async () => {
			const res = await axios({
				method: 'get',
				url: `https://restcountries.eu/rest/v2/name/${name}?fullText=true`
			})
			const data = res.data
			setData(data[0])
		}
		fn()
	}, [name])
	return data
}

const Country = ({ country }) => {
	if (!country) {
		return null
	}

	return (
		<div>
			<h3>{country.name} </h3>
			<div>capital {country.capital} </div>
			<div>population {country.population}</div>
			<img src={country.flag} height='100' alt={`flag of ${country.name}`} />
		</div>
	)
}

const App = () => {
	const nameInput = useField('text')
	const [name, setName] = useState(null)
	const country = useCountry(name)

	const fetch = (e) => {
		e.preventDefault()
		setName(nameInput.value)
	}

	return (
		<div>
			<form onSubmit={fetch}>
				<input {...nameInput} />
				<button>find</button>
			</form>

			<Country country={country} />
		</div>
	)
}

export default App
