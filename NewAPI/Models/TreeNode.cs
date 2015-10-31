using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace TheDownLoad.Models
{
    [DataContract]
    public class TreeNode
    {
        
        public TreeNode()
        {
        }
        [DataMember]
        public bool isParent { get; set; }
        [DataMember]
        public string filepath { get; set; }
        [DataMember]
        public string name { get; set; }
        public TreeNode(bool IsParent, string Filepath, string Name)
        {
            this.isParent = IsParent;
            this.filepath = Filepath;
            this.name = Name;
        }
    }
}