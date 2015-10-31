using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace TheDownLoad.Models
{
    [DataContract] 
    public class FileProperty
    {
       
        [DataMember]
        public string path { get; set; }
        [DataMember]
        public string name { get; set; }
        [DataMember]
        public string  size { get; set; }
        public FileProperty(){
        
        }
        public FileProperty(string Path, string Name, string Size)
        {
            this.path = Path;
            this.name = Name;
            this.size = Size;
        }
    }
}