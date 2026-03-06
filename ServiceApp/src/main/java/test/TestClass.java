package test;

import java.util.Arrays;

public class TestClass {
    
    public static void main(String[] args) {
     
        System.out.println("Hello World");
        
    int[] nums1 = {1,2,3,0,0,0};
    int[] nums2 = {2,5,6};

    int[] mergearray = new int[nums1.length+nums2.length];

    int mergearrayindex=0;

    for (int i=0; i<nums1.length;i++) {


        int temp = nums1[i];

        for (int j=0; j<nums2.length;j++) {


            if(nums1[i]<nums2[j]){

                temp = nums1[i];

            }else if(nums1[i]==nums2[j] &&  nums1[i]<temp ){

                temp = nums1[i];

            }else{

                temp = nums2[j];
                break;
            }
           
        }

        mergearray[i] = temp;
        mergearrayindex++;

    }
    }
    
}


