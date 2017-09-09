## Post-Installation Administration and Management

This document covers key tasks that relate to the ongoing maintenance and administration of a Piecewise server.

### Updating the Piecewise Application

#### Updating the Front-end Website

You'll undoubtedly want to make customizations to the visual display from its default colors, layout, text, etc. These edits are typically done on the files you've cloned to your local computer, and pushed to your server using a series of Ansible playbooks that we've prepared.

The process of updating the Piecewise website follows these steps:

* Update variable values in ```ansible/group_vars/all/piecewise_global_config.yml```
* Update CSS, fonts, images, JavaScript:
  * ```piecewise_web/css/```
  * ```piecewise_web/fonts/```
  * ```piecewise_web/images/```
  * ```piecewise_web/js/```
* Run the Ansible playbook: ```ansible/update_frontend.yml```

If you wish to make text changes to the website provided by Piecewise, update the variable values in the Piecewise global configuration file. If you wish to make CSS or font changes, edit the files in the directories above. Any images or JavaScripts you want to add should be added to the appropriate folders above.

**NOTE:** If you are making changes to the website form elements, you will also need to update the Piecwise Back-end in the next section.

#### Updating the Back-end Database and System Configurations
TBD

### Database Management 

PostgreSQL provides excellent documentation on how to manage databases, and you should review it to determine your needs for your systems and environment. We provide some basic functions below as it applies to Piecewise for convenience.

#### Export/Import Piecewise Database

To export your database: ```$ sudo pg_dump -U postgres piecewise > pw_database_dump_05152017```

To import a previous data export onto: 
```
$ sudo su postgres
postgres@yourserver:$ psql piecewise < pw_database_dump05152017 
```

**NOTE:** The import command above assumes you are importing data into a newly created database. 

## Further Reading

Additional resources on Piecewise:

  * [How Piecewise Works](how-piecewise-works.md) 
  * [Statistics in Piecewise](piecewise-statistics.md)
