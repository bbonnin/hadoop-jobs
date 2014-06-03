hadoop-jobs
===========

Web interface for Hadoop jobs. This application gives some stats about job, such as average map and reduce time by host.

The application has been tested with [Hortonworks Data Platform 2.1](http://hortonworks.com/hdp/).


## Installation

``` bash
    npm install
```

## Configuration

Edit the config.json file to set your Hadoop clusters:

``` json
{
    "clusters" : {
        "dev_cluster" : {
            "host" : "history_server_dev_host",
            "port" : 19888
        },

        "prod_cluster" : {
            "host" : "history_server_prod_host",
            "port" : 19888
        }
    }
}
``` 

## Run

* Normal mode : 
``` bash
    node app.js
```

* Test mode (it will use json files present in the "test" directory) : 
``` bash
    node app.js test
```

## Examples

* First page : the job list
![Job list](/docs/joblist.png)

* Second page : job detail

![Job detail - part 1](/docs/job_part1.png)

![Job detail - part 2](/docs/job_part2.png)


