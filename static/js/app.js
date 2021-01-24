d3.json("../samples.json").then((allData) => {

    var names = allData.names; // Get the subject IDs
    var metadata = allData.metadata; // Get all the metadata
    var samples = allData.samples; // Get all the samples

    //Load all ID options
    names.forEach((id) => {
        d3.select("#selDataset")
            .append("option")
            .text(id)
            .attr("value", id);
    });

    /* Event handler function definitions */
    //Function to load all Sample metadata based on the given metadata
    function loadSampleMetadata(){
        d3.select("#sample-metadata").html("");

        //Current id that is selected in the ID dropdown
        var selectedId = d3.select("#selDataset").property("value");
        var selectedMetadata = metadata.filter((data) => data.id == selectedId)[0];

        for(const [key, value] of Object.entries(selectedMetadata)){
            d3.select("#sample-metadata").append("div")
                .text(key.charAt(0).toUpperCase() + key.slice(1) + ": " + value);
        }
    }

    //Format the samples into arrays of json format
    function generateSampleJson(){
        //Current id that is selected in the ID dropdown
        var selectedId = d3.select("#selDataset").property("value");
        var selectedSample = samples.filter((data) => data.id == selectedId)[0];
        var otu_ids = selectedSample.otu_ids;
        var otu_labels = selectedSample.otu_labels;
        var sample_values = selectedSample.sample_values;
        var otu_properties = [];
        var idx = 0;
        
        // Move the properties into an array of jsons
        sample_values.forEach((sample_value) => {
            otu_properties.push({
                "otu_value": sample_value,
                "otu_id": otu_ids[idx],
                "otu_label": otu_labels[idx],
            });

            idx += 1;
        });

        // sort the json into descending order based on the otu values
        otu_properties.sort((a, b) => b.otu_value - a.otu_value);

        return otu_properties;
    }

    function loadBarChart(){
        // Clear the old bar chart 
        d3.select("#bar").html("");

        var otu_properties = generateSampleJson();
        var top_ten_otu = otu_properties.splice(0, 10).reverse();

        console.log(top_ten_otu);

        var margin = {top: 20, right: 20, bottom: 30, left: 40};
        var width = 960 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;

        // set the ranges
        var y = d3.scaleBand()
                .range([height, 0])
                .padding(0.3);

        var x = d3.scaleLinear()
                .range([0, width]);
                
        // append the svg object to the body of the page
        var svg = d3.select("#bar").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data in the domains
        x.domain([0, d3.max(top_ten_otu, (otu) => otu.otu_value)]);
        y.domain(top_ten_otu.map((otu) => otu.otu_id));

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(top_ten_otu)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("label", (otu) => otu.out_label)
            .attr("width", (otu) => x(otu.otu_value) )
            .attr("y", (otu) => y(otu.otu_id))
            .attr("height", y.bandwidth())
            .append("title")
            .text((otu) => otu.otu_label);

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));
    }

    function loadBubbleChart(){
        // Clear the old bubble chart 
        d3.select("#bubble").html("");

        //Current id that is selected in the ID dropdown
        var selectedId = d3.select("#selDataset").property("value");
        var selectedSample = samples.filter((data) => data.id == selectedId)[0];
        var otu_ids = selectedSample.otu_ids;
        var otu_labels = selectedSample.otu_labels;
        var sample_values = selectedSample.sample_values;

        var otu_properties = generateSampleJson();

        var margin = {top: 40, right: 150, bottom: 60, left: 30};
        var width = 1100 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;

        var svg = d3.select("#bubble").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
                .domain([0, d3.max(otu_ids) + 100])
                .range([50, width]);
          
        // Add Y axis
        var y = d3.scaleLinear()
            .domain([-50, d3.max(sample_values) + 100])
            .range([height , 0]);
          
        // Add a scale for bubble size
        var z = d3.scaleSqrt()
            .domain([0, d3.max(sample_values)])
            .range([0.05, 80]);
          
        // Add a scale for bubble color
        var myColor = d3.scaleOrdinal()
            .domain(sample_values)
            .range(d3.schemeSet1);
        
        console.log(otu_properties);

        // Add dots
        svg.selectAll(".bubble")
            .data(otu_properties)
            .enter()
            .append("circle")
            .attr("class", function() { return "bubble"})
            .attr("cx", function (d) { return x(d.otu_id); } )
            .attr("cy", function (d) { return y(d.otu_value); } )
            .attr("r", function (d) { return z(d.otu_value); } )
            .style("fill", function (d) { return myColor(d.otu_id); } )
            .style("opacity", 0.7)
            .append("title")
            .text((otu) => otu.otu_label);
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(10));
        
        svg.append("g")
            .call(d3.axisLeft(y));
    }

    function handleSubjectChange(){
        loadSampleMetadata();
        loadBarChart();
        loadBubbleChart();
    }
    
    //Event handler calls
    d3.select("#selDataset").on("change", handleSubjectChange);
    
    //Load data at the beginning
    loadSampleMetadata();
    loadBarChart();
    loadBubbleChart();
    
});